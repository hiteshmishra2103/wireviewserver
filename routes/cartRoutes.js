const express = require("express");
const { authenticateJwt } = require("../middleware/auth");
const { getCart, getCartQuantity, deleteFromCart, addToCart } = require("../controllers/cartController");

const router = express.Router();

router.get("/", authenticateJwt, getCart);
router.get("/quantity", authenticateJwt, getCartQuantity);
router.delete("/:productId", authenticateJwt, deleteFromCart);
router.post("/", authenticateJwt, addToCart);

module.exports = router;
