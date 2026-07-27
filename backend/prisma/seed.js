const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.io' },
    update: {},
    create: {
      name: 'Alex Admin',
      email: 'admin@demo.io',
      password: adminPassword,
      role: 'admin',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'maya@demo.io' },
    update: {},
    create: {
      name: 'Maya Chen',
      email: 'maya@demo.io',
      password: userPassword,
      role: 'user',
    },
  });

  console.log('Created users:', { admin, user });

  const categories = [];
  const categoryNames = ['Work', 'Personal', 'Learning', 'Health'];

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
  }

  console.log('Created categories:', categories);

  const today = new Date();
  const addDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const tasks = [
    {
      title: 'Ship onboarding revamp',
      description: 'Polish empty states and copy.',
      status: 'doing',
      dueDate: addDays(2),
      userId: user.id,
      categoryId: categories[0].id,
    },
    {
      title: 'Morning run — 5k',
      description: 'Easy pace.',
      status: 'todo',
      dueDate: addDays(1),
      userId: user.id,
      categoryId: categories[3].id,
    },
    {
      title: 'Finish React course module 6',
      description: 'Suspense + streaming.',
      status: 'todo',
      dueDate: addDays(-1),
      userId: user.id,
      categoryId: categories[2].id,
    },
    {
      title: 'Review team OKRs',
      description: 'Q3 planning notes.',
      status: 'done',
      dueDate: addDays(-3),
      userId: admin.id,
      categoryId: categories[0].id,
    },
    {
      title: 'Book dentist appt',
      description: '',
      status: 'todo',
      dueDate: addDays(5),
      userId: admin.id,
      categoryId: categories[1].id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log('Created tasks');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
