const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};

const getTasks = async (req, res) => {
  try {
    const where = req.user.role === 'admin'
      ? {}
      : { userId: req.user.id };

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

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, categoryId } = req.body;

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        dueDate: new Date(dueDate),
        userId: req.user.id,
        categoryId: categoryId || null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, categoryId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        categoryId: categoryId !== undefined ? categoryId : task.categoryId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (task.status === 'done') {
      return res.status(400).json({ error: 'Cannot change status of completed task' });
    }

    if (isOverdue(task.dueDate) && task.status !== 'done') {
      return res.status(400).json({ error: 'Cannot change status after due date has passed' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      message: 'Task status updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
