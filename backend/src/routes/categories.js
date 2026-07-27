const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateCategory } = require('../utils/validators');

router.get('/', authenticate, getCategories);
router.post('/', authenticate, requireAdmin, validateCategory, createCategory);
router.put('/:id', authenticate, requireAdmin, validateCategory, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

module.exports = router;
