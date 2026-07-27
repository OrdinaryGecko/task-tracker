const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validateTask, validateStatusUpdate } = require('../utils/validators');

router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTask);
router.post('/', authenticate, validateTask, createTask);
router.put('/:id', authenticate, validateTask, updateTask);
router.patch('/:id/status', authenticate, validateStatusUpdate, updateTaskStatus);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
