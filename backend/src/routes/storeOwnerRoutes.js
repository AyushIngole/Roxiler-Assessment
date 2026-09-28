const express = require('express');
const { dashboard } = require('../controllers/storeOwnerController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', dashboard);

module.exports = router;
