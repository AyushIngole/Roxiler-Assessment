const express = require('express');
const {
  dashboard,
  createUser,
  createStore,
  listStores,
  listUsers,
  getUserDetails,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { nameRule, addressRule, emailRule, passwordRule, handleValidation } = require('../validators');
const { body } = require('express-validator');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', dashboard);

router.post(
  '/users',
  [
    nameRule(),
    emailRule(),
    addressRule(),
    passwordRule(),
    body('role').optional().isIn(['ADMIN', 'USER', 'STORE_OWNER']),
    handleValidation,
  ],
  createUser
);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);

router.post(
  '/stores',
  [
    body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Store name is required (max 60 chars)'),
    emailRule(),
    addressRule(),
    body('ownerId').optional({ nullable: true }).isInt().withMessage('ownerId must be an integer'),
    handleValidation,
  ],
  createStore
);

router.get('/stores', listStores);

module.exports = router;
