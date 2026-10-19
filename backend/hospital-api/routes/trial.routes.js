const express = require("express");
const router = express.Router();

const trialController = require("../controllers/trial.controller");

// Public route — no auth. Trial is the entry point for new customers.
router.post("/", trialController.activateTrial);

module.exports = router;
