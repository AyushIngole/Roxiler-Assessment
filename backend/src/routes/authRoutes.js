const express = require('express');
const { signup, login, updatePassword, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  nameRule,
  addressRule,
  emailRule,
  passwordRule,
  handleValidation,
} = require('../validators');
const { body } = require('express-validator');

const router = express.Router();

router.post(
  '/signup',
  [nameRule(), emailRule(), addressRule(), passwordRule(), handleValidation],
  signup
);

router.post(
  '/login',
  [emailRule(), body('password').notEmpty().withMessage('Password is required'), handleValidation],
  login
);

router.get('/me', authenticate, me);

router.put(
  '/update-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordRule('newPassword'),
    handleValidation,
  ],
  updatePassword
);

module.exports = router;
