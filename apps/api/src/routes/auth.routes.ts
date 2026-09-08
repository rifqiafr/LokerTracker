import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'loker_super_secret_jwt_key_development_2026';
const JWT_EXPIRES_IN = '7d';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// Helper to generate token
const createToken = (user: { id: string; email: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Input tidak valid',
      });
      return;
    }

    const { name, email, password } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = createToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Input tidak valid',
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
      return;
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    const token = createToken(safeUser);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login',
    });
  }
});

const oauthSchema = z.object({
  provider: z.enum(['google', 'github']),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().optional(),
});

// POST /api/auth/oauth (Google / GitHub)
router.post('/oauth', async (req, res: Response): Promise<void> => {
  try {
    const parseResult = oauthSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Data OAuth tidak valid',
      });
      return;
    }

    const { provider, email, name, avatarUrl } = parseResult.data;
    const lowerEmail = email.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          email: lowerEmail,
          name,
          passwordHash,
          avatarUrl:
            avatarUrl ||
            (provider === 'google'
              ? `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`
              : `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80`),
        },
      });

      // Populate initial starter jobs for newly registered OAuth user
      const initialSeedJobs = [
        {
          company: provider === 'google' ? 'Google Developer Studio' : 'GitHub Indonesia Community',
          role: 'Fullstack Software Engineer',
          location: 'Remote',
          salary: 'Rp 22.000.000 - Rp 32.000.000',
          status: 'applied',
          priority: 'high',
          notes: `Akun dibuat melalui ${provider === 'google' ? 'Google' : 'GitHub'} Sign-In.`,
          tags: [provider.toUpperCase(), 'Remote', 'Fullstack'],
          orderIndex: 0,
        },
        {
          company: 'GoTo Financial',
          role: 'Backend Go Engineer',
          location: 'Jakarta Selatan',
          salary: 'Rp 18.000.000 - Rp 26.000.000',
          status: 'test',
          priority: 'high',
          notes: 'Tes HackerRank & arsitektur microservices.',
          tags: ['Go', 'Postgres', 'Kafka'],
          orderIndex: 0,
        },
      ];

      for (const j of initialSeedJobs) {
        await prisma.job.create({
          data: {
            userId: user.id,
            company: j.company,
            role: j.role,
            location: j.location,
            salary: j.salary,
            status: j.status,
            priority: j.priority,
            notes: j.notes,
            tags: JSON.stringify(j.tags),
            orderIndex: j.orderIndex,
            timeline: {
              create: {
                stageTo: j.status,
                notes: 'Lamaran dibuat',
              },
            },
          },
        });
      }
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    const token = createToken(safeUser);

    res.json({
      success: true,
      message: `Login dengan ${provider} berhasil`,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    console.error('Error during oauth:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat autentikasi OAuth',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil pengguna',
    });
  }
});

// PUT /api/auth/profile - Update candidate profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
      return;
    }

    const { name, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && typeof name === 'string' && name.trim() ? { name: name.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil pengguna',
    });
  }
});

export default router;

