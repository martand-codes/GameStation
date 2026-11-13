import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    }
  });
  console.log('--- ALL USERS IN DB ---');
  console.log(JSON.stringify(users, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

