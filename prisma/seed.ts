import { PrismaClient } from '@prisma/client';

import { seedDb } from './seedService';

const prisma = new PrismaClient();
seedDb(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
