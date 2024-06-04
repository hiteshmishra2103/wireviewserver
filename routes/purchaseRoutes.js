const express = require('express');
const router = express.Router();
const { purchaseProducts } = require('../controllers/purchaseController');
const { authenticateJwt } = require('../middleware/auth');


router.post('/', authenticateJwt, purchaseProducts);

module.exports = router;
