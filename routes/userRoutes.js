const express = require("express");
const { authenticateJwt } = require("../middleware/auth");
const { getUsers } = require('../controllers/usercontroller')

const router = express.Router();

router.get("/profile", authenticateJwt, getUsers);

module.exports = router;
