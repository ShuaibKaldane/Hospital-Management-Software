const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/admin/login", authController.adminLogin);

module.exports = router;