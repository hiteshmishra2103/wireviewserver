const express = require("express");
const { getAllProducts, getProductById, addProduct, updateProduct } = require("../controllers/productController");
const { authenticateJwt } = require("../middleware/auth");
const { searchProducts } = require("../controllers/productController");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.post("/add", authenticateJwt, addProduct);
router.put("/updateProduct/:id", authenticateJwt, updateProduct);
router.get("/search", searchProducts);

module.exports = router;
