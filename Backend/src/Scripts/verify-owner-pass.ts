import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testPassword() {
  const user = await prisma.user.findFirst({
    where: { username: { equals: 'Martand_Prakhar', mode: 'insensitive' } }
  });
  if (!user) {
    console.log('USER NOT FOUND');
    return;
  }
  console.log('Found user:', user.username, 'email:', user.email, 'role:', user.role);
  const match = await bcrypt.compare('adgjmptw@01@25LPA', user.password);
  console.log('Password match test:', match ? 'VALID' : 'INVALID');
  
  if (!match) {
    // If not matching, let's update it to the requested password!
    const newHash = await bcrypt.hash('adgjmptw@01@25LPA', 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    });
    console.log('Updated password to adgjmptw@01@25LPA successfully!');
  }
}

testPassword().catch(console.error).finally(() => prisma.$disconnect());

