const express = require("express");
const { authenticateJwt } = require("../middleware/auth");
const getUserProfile = require("../controllers/meController");

const router = express.Router();

router.get("/", authenticateJwt, getUserProfile);

module.exports = router;
