const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/Users");
const { stripeCheckout } = require("../controllers/stripeCheckoutController");
const { authenticateJwt } = require("../middleware/auth");

router.post("/", authenticateJwt, stripeCheckout);
module.exports = router;