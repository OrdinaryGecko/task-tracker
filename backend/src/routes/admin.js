const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/users', authenticate, requireAdmin, getUsers);

module.exports = router;
