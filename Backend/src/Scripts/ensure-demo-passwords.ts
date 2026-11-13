import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const accounts = [
  { username: 'Martand_Prakhar', pass: 'adgjmptw@01@25LPA' },
  { username: 'Admin@GS01', pass: 'Admin@01' },
  { username: 'RockstarGames', pass: 'rockstar@001' },
  { username: 'Player@01', pass: 'Player@01' }
];

async function ensureAccounts() {
  for (const acc of accounts) {
    const user = await prisma.user.findFirst({
      where: { username: { equals: acc.username, mode: 'insensitive' } }
    });
    if (!user) {
      console.log('MISSING:', acc.username);
      continue;
    }
    const match = await bcrypt.compare(acc.pass, user.password);
    if (!match) {
      console.log(`Password mismatch for ${acc.username}. Updating to requested password...`);
      const newHash = await bcrypt.hash(acc.pass, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      console.log(`Updated ${acc.username} password.`);
    } else {
      console.log(`Verified ${acc.username} password is VALID.`);
    }
  }
}

ensureAccounts().catch(console.error).finally(() => prisma.$disconnect());

