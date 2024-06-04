const express = require("express");
const { getAllProducts, getProductById, addProduct, updateProduct } = require("../controllers/productController");
const { authenticateJwt } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.post("/addProduct", authenticateJwt, addProduct);
router.put("/updateProduct/:id", authenticateJwt, updateProduct);



module.exports = router;
