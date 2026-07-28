const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  handleValidationErrors,
];

const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('categoryId').optional({ nullable: true }).isString(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
  handleValidationErrors,
];

const validateStatusUpdate = [
  body('status').isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateCategory,
  validateTask,
  validateStatusUpdate,
};
