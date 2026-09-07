import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/analytics/metrics
router.get('/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [
      total,
      appliedCount,
      testCount,
      interviewCount,
      offeredCount,
      rejectedCount,
      highPriorityCount,
    ] = await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, status: 'applied' } }),
      prisma.job.count({ where: { userId, status: 'test' } }),
      prisma.job.count({ where: { userId, status: 'interview' } }),
      prisma.job.count({ where: { userId, status: 'offered' } }),
      prisma.job.count({ where: { userId, status: 'rejected' } }),
      prisma.job.count({ where: { userId, priority: 'high' } }),
    ]);

    const activeCount = appliedCount + testCount + interviewCount;
    const interviewRate = total > 0 ? Math.round(((interviewCount + offeredCount) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offeredCount / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        active: activeCount,
        stages: {
          applied: appliedCount,
          test: testCount,
          interview: interviewCount,
          offered: offeredCount,
          rejected: rejectedCount,
        },
        priority: {
          high: highPriorityCount,
        },
        rates: {
          interviewRate,
          offerRate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data analitik' });
  }
});

export default router;
