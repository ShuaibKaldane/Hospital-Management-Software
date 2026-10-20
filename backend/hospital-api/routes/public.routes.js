const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

/**
 * Public, unauthenticated routes mounted under `/api`.
 * Keep this list short — anything sensitive belongs behind auth routers.
 */
router.get("/hospitals", authController.listHospitals);

module.exports = router;
