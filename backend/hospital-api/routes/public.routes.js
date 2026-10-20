const express = require("express");
const router = express.Router();

const authController   = require("../controllers/auth.controller");
const publicController = require("../controllers/public.controller");

/**
 * Public, unauthenticated routes mounted under `/api`.
 * Keep this list short — anything sensitive belongs behind auth routers.
 */
router.get ("/hospitals", authController.listHospitals);
router.post("/hospitals", publicController.createHospital);

module.exports = router;
