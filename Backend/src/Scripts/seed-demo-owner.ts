import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemoOwner() {
  const existing = await prisma.user.findFirst({
    where: { username: { equals: 'Demo_Owner', mode: 'insensitive' } }
  });

  const hashedPassword = await bcrypt.hash('DemoOwner@2026', 10);

  if (existing) {
    console.log('Demo_Owner exists. Updating password & ensuring OWNER role...');
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        role: Role.OWNER,
        isActive: true
      }
    });
    console.log('Demo_Owner updated successfully.');
  } else {
    console.log('Creating new Demo_Owner account...');
    await prisma.user.create({
      data: {
        username: 'Demo_Owner',
        email: 'demo.owner@gamestation.com',
        password: hashedPassword,
        role: Role.OWNER,
        isActive: true
      }
    });
    console.log('Demo_Owner created successfully.');
  }
}

seedDemoOwner()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

