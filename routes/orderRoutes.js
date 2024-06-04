const express = require("express");
const { authenticateJwt } = require("../middleware/auth");
const { getOrders, checkout, updateOrderStatus, getOrderHistory } = require("../controllers/orderController");

const router = express.Router();

router.get("/", authenticateJwt, getOrders);
// router.post("/checkout", authenticateJwt, checkout);
router.put("/:orderId", authenticateJwt, updateOrderStatus);
router.get("/history", authenticateJwt, getOrderHistory);

module.exports = router;
