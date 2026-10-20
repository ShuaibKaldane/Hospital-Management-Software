const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/super-admin/login", authController.superAdminLogin);
router.post("/admin/login",        authController.adminLogin);
router.post("/doctor/login",       authController.doctorLogin);
router.post("/patient/login",      authController.patientLogin);

router.post("/doctor/signup",      authController.doctorSignup);
router.post("/patient/signup",     authController.patientSignup);

module.exports = router;
