const { body, query, validationResult } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\];'/\\]).{8,16}$/;

const nameRule = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage(`${field} must be between 20 and 60 characters`);

const addressRule = (field = 'address') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage(`${field} must be at most 400 characters`);

const emailRule = (field = 'email') =>
  body(field).trim().isEmail().withMessage('A valid email is required').normalizeEmail();

const passwordRule = (field = 'password') =>
  body(field)
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must be 8-16 characters and include at least one uppercase letter and one special character'
    );

const ratingRule = (field = 'value') =>
  body(field).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
}

module.exports = {
  PASSWORD_REGEX,
  nameRule,
  addressRule,
  emailRule,
  passwordRule,
  ratingRule,
  handleValidation,
};
