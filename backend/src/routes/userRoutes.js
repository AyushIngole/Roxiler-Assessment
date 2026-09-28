const express = require('express');
const { listStores, submitRating } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingRule, handleValidation } = require('../validators');

const router = express.Router();

router.use(authenticate, authorize('USER'));

router.get('/stores', listStores);
router.post('/stores/:storeId/ratings', [ratingRule(), handleValidation], submitRating);

module.exports = router;
