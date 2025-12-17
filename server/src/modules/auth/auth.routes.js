const express = require('express');
const router = express.Router();
const { validate } = require('../../middlewares/validate');
const { requireAuth } = require('../../middlewares/auth');
const {
  register,
  login,
  getMe,
  verifyEmail,
} = require('./auth.controller');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
} = require('./auth.validation');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, getMe);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

module.exports = router;
