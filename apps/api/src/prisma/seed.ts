import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menjalankan database seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@loker.id' },
    update: {},
    create: {
      email: 'demo@loker.id',
      name: 'Rian Pratama',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  });

  console.log(`👤 User demo siap: ${demoUser.email} (password: password123)`);

  // Clear existing jobs for clean seed
  await prisma.jobTimeline.deleteMany({ where: { job: { userId: demoUser.id } } });
  await prisma.jobContact.deleteMany({ where: { job: { userId: demoUser.id } } });
  await prisma.job.deleteMany({ where: { userId: demoUser.id } });

  const initialJobsData = [
    // Applied
    {
      company: 'Tokopedia',
      role: 'Fullstack Engineer',
      location: 'Jakarta Selatan',
      salary: 'Rp 14.000.000 - Rp 22.000.000',
      status: 'applied',
      priority: 'high',
      notes: 'Applied via TechInAsia job board. Stack: React, Go, Kafka.',
      tags: ['Fullstack', 'Go', 'React'],
      orderIndex: 0,
    },
    {
      company: 'Bank Mandiri',
      role: 'IT Specialist / DevOps',
      location: 'Jakarta',
      salary: 'Rp 16.000.000 - Rp 24.000.000',
      status: 'applied',
      priority: 'medium',
      notes: 'Applied through Mandiri Careers portal.',
      tags: ['DevOps', 'Kubernetes', 'Banking'],
      orderIndex: 1,
    },
    // Test
    {
      company: 'Gojek Indonesia',
      role: 'Frontend Dev',
      location: 'Remote',
      salary: 'Rp 15.000.000 - Rp 25.000.000',
      status: 'test',
      priority: 'high',
      notes: 'Coding challenge HackerRank sebelum 7 September.',
      tags: ['React', 'TypeScript', 'Tailwind'],
      orderIndex: 0,
    },
    {
      company: 'Bukalapak',
      role: 'Data Engineer',
      location: 'Jakarta',
      salary: 'Rp 12.000.000 - Rp 18.000.000',
      status: 'test',
      priority: 'medium',
      notes: 'Take-home project ETL pipeline.',
      tags: ['BigQuery', 'dbt', 'Python'],
      orderIndex: 1,
    },
    {
      company: 'Traveloka',
      role: 'iOS Developer',
      location: 'Hybrid',
      salary: 'Rp 18.000.000 - Rp 25.000.000',
      status: 'test',
      priority: 'high',
      notes: 'Live coding sesi 1 jam implementasi SwiftUI Views.',
      tags: ['iOS', 'SwiftUI', 'VIPER'],
      orderIndex: 2,
    },
    // Interview
    {
      company: 'Shopee',
      role: 'Senior React Dev',
      location: 'Hybrid (Jakarta)',
      salary: 'Rp 20.000.000 - Rp 30.000.000',
      status: 'interview',
      priority: 'high',
      notes: 'User interview dengan Engineering Lead.',
      tags: ['React', 'Next.js', 'System Design'],
      orderIndex: 0,
    },
    {
      company: 'Blibli',
      role: 'Backend Golang',
      location: 'Jakarta Barat',
      salary: 'Rp 16.000.000 - Rp 23.000.000',
      status: 'interview',
      priority: 'medium',
      notes: 'HR Interview selesai, lanjut User Interview.',
      tags: ['Go', 'Microservices', 'Postgres'],
      orderIndex: 1,
    },
    // Offered
    {
      company: 'Ajaib',
      role: 'Web Platform Engineer',
      location: 'Remote',
      salary: 'Rp 24.000.000',
      status: 'offered',
      priority: 'high',
      notes: 'Offering letter diterima! Deadline tanda tangan 12 September.',
      tags: ['Fintech', 'TypeScript', 'Web'],
      orderIndex: 0,
    },
    // Rejected
    {
      company: 'DANA Indonesia',
      role: 'Frontend Engineer',
      location: 'Jakarta',
      salary: 'Rp 13.000.000 - Rp 17.000.000',
      status: 'rejected',
      priority: 'low',
      notes: 'Kandidat lain memiliki pengalaman spesifik fintech mobile lebih banyak.',
      tags: ['Payment', 'React'],
      orderIndex: 0,
    },
  ];

  for (const job of initialJobsData) {
    await prisma.job.create({
      data: {
        userId: demoUser.id,
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        status: job.status,
        priority: job.priority,
        notes: job.notes,
        orderIndex: job.orderIndex,
        tags: JSON.stringify(job.tags),
        timeline: {
          create: {
            stageTo: job.status,
            notes: `Status awal: ${job.status}`,
          },
        },
      },
    });
  }

  console.log(`✅ Berhasil seed ${initialJobsData.length} data lowongan untuk ${demoUser.email}`);
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
