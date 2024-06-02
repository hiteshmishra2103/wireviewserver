const express = require('express');
const router = express.Router();
const { purchaseProducts } = require('../controllers/purchaseController'); // Adjust the path as necessary
const authenticateJwt = require('../middlewares/authenticateJwt'); // Adjust the path as necessary

router.post('/purchase', authenticateJwt, purchaseProducts);

module.exports = router;
