const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const { userId, status, dueDate, search } = req.query;

    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      if (status === 'overdue') {
        where.AND = [
          { status: { not: 'done' } },
          { dueDate: { lt: new Date() } },
        ];
      } else {
        where.status = status;
      }
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.dueDate = {
        gte: date,
        lt: nextDay,
      };
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    const stats = await prisma.task.aggregate({
      _count: { id: true },
    });

    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const overdueCount = await prisma.task.count({
      where: {
        status: { not: 'done' },
        dueDate: { lt: new Date() },
      },
    });

    res.json({
      tasks,
      users,
      stats: {
        total: stats._count.id,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
        overdue: overdueCount,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = {
  getDashboard,
};
