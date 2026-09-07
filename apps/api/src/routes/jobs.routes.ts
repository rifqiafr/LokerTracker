import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { extractJobFromUrl } from '../lib/urlJobExtractor.js';

const router = Router();

const extractUrlSchema = z.object({
  url: z.string().min(1, 'URL wajib diisi'),
});

// POST /api/jobs/extract-url - Extract job details from URL (OpenGraph / Metadata)
router.post('/extract-url', async (req, res): Promise<void> => {
  try {
    const parseResult = extractUrlSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Input URL tidak valid',
      });
      return;
    }

    const { url } = parseResult.data;
    const extractedData = await extractJobFromUrl(url);

    res.json({
      success: true,
      message: 'Berhasil mengekstrak informasi lowongan dari tautan',
      data: extractedData,
    });
  } catch (error: any) {
    console.error('Error extracting job from URL:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Gagal mengekstrak data dari URL',
    });
  }
});

// Protect all following job CRUD routes with JWT
router.use(authenticateToken);

const createJobSchema = z.object({
  company: z.string().min(1, 'Nama perusahaan wajib diisi'),
  role: z.string().min(1, 'Posisi/jabatan wajib diisi'),
  location: z.string().default('Remote / Hybrid'),
  salary: z.string().optional(),
  status: z.enum(['applied', 'test', 'interview', 'offered', 'rejected']).default('applied'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  notes: z.string().optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const updateJobSchema = createJobSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(['applied', 'test', 'interview', 'offered', 'rejected']),
  orderIndex: z.number().int().optional(),
  note: z.string().optional(),
});

// GET /api/jobs - List all jobs for the authenticated user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, search } = req.query;

    const where: any = { userId };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { company: { contains: search } },
        { role: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { orderIndex: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        timeline: {
          orderBy: { movedAt: 'desc' },
          take: 5,
        },
      },
    });

    const parsedJobs = jobs.map((job) => ({
      ...job,
      tags: (() => {
        try {
          return JSON.parse(job.tags);
        } catch {
          return [];
        }
      })(),
    }));

    res.json({
      success: true,
      data: { jobs: parsedJobs },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data lowongan kerja' });
  }
});

// GET /api/jobs/:id - Get job detail
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: {
        timeline: {
          orderBy: { movedAt: 'desc' },
        },
        contacts: true,
      },
    });

    if (!job) {
      res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      data: {
        job: {
          ...job,
          tags: (() => {
            try {
              return JSON.parse(job.tags);
            } catch {
              return [];
            }
          })(),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching job detail:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail lowongan' });
  }
});

// POST /api/jobs - Create a new job
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const parseResult = createJobSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Input tidak valid',
      });
      return;
    }

    const data = parseResult.data;

    // Count existing in that status for orderIndex
    const countInStatus = await prisma.job.count({
      where: { userId, status: data.status },
    });

    const newJob = await prisma.job.create({
      data: {
        userId,
        company: data.company,
        role: data.role,
        location: data.location,
        salary: data.salary,
        status: data.status,
        priority: data.priority,
        notes: data.notes,
        deadline: data.deadline ? new Date(data.deadline) : null,
        orderIndex: countInStatus,
        tags: JSON.stringify(data.tags || []),
        timeline: {
          create: {
            stageTo: data.status,
            notes: 'Lamaran dibuat',
          },
        },
      },
      include: {
        timeline: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Lowongan berhasil ditambahkan',
      data: {
        job: {
          ...newJob,
          tags: data.tags,
        },
      },
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan lowongan baru' });
  }
});

// PATCH /api/jobs/:id/status - Update stage / status (Drag and drop)
router.patch('/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = updateStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Status tidak valid',
      });
      return;
    }

    const { status: newStatus, orderIndex, note } = parseResult.data;

    // Check existing job
    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
      return;
    }

    const oldStatus = existingJob.status;

    // Update job and insert timeline event if status changed
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: newStatus,
        orderIndex: orderIndex ?? existingJob.orderIndex,
        ...(oldStatus !== newStatus
          ? {
              timeline: {
                create: {
                  stageFrom: oldStatus,
                  stageTo: newStatus,
                  notes: note || `Status dipindahkan dari ${oldStatus} ke ${newStatus}`,
                },
              },
            }
          : {}),
      },
      include: {
        timeline: {
          orderBy: { movedAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({
      success: true,
      message: 'Status berhasil diperbarui',
      data: {
        job: {
          ...updatedJob,
          tags: (() => {
            try {
              return JSON.parse(updatedJob.tags);
            } catch {
              return [];
            }
          })(),
        },
      },
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status lowongan' });
  }
});

// PATCH /api/jobs/:id/archive - Toggle or set isArchived state
router.patch('/:id/archive', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { isArchived } = req.body;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
      return;
    }

    const newArchived = typeof isArchived === 'boolean' ? isArchived : !existingJob.isArchived;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        isArchived: newArchived,
        timeline: {
          create: {
            stageTo: existingJob.status,
            notes: newArchived ? 'Lamaran dipindahkan ke arsip' : 'Lamaran dipulihkan dari arsip',
          },
        },
      },
      include: {
        timeline: {
          orderBy: { movedAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({
      success: true,
      message: newArchived ? 'Lowongan berhasil diarsipkan' : 'Lowongan berhasil dipulihkan',
      data: {
        job: {
          ...updatedJob,
          tags: (() => {
            try {
              return JSON.parse(updatedJob.tags);
            } catch {
              return [];
            }
          })(),
        },
      },
    });
  } catch (error) {
    console.error('Error updating archive status:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status arsip' });
  }
});

// PUT /api/jobs/:id - Update full job
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = updateJobSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Input tidak valid',
      });
      return;
    }

    const data = parseResult.data;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
      return;
    }

    const updatePayload: any = {};
    if (data.company !== undefined) updatePayload.company = data.company;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.salary !== undefined) updatePayload.salary = data.salary;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.deadline !== undefined) {
      updatePayload.deadline = data.deadline ? new Date(data.deadline) : null;
    }
    if (data.tags !== undefined) {
      updatePayload.tags = JSON.stringify(data.tags);
    }
    if ((data as any).isArchived !== undefined) {
      updatePayload.isArchived = (data as any).isArchived;
    }

    const updated = await prisma.job.update({
      where: { id },
      data: updatePayload,
      include: {
        timeline: {
          orderBy: { movedAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({
      success: true,
      message: 'Lowongan berhasil diperbarui',
      data: {
        job: {
          ...updated,
          tags: (() => {
            try {
              return JSON.parse(updated.tags);
            } catch {
              return [];
            }
          })(),
        },
      },
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui lowongan' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingJob = await prisma.job.findFirst({
      where: { id, userId },
    });

    if (!existingJob) {
      res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
      return;
    }

    await prisma.job.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Lowongan berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus lowongan' });
  }
});

export default router;
