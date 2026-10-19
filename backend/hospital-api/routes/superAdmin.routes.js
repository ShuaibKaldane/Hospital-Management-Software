const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const superAdminController = require("../controllers/superAdmin.controller");

// All endpoints require JWT + SUPER_ADMIN role.
router.use(authenticate, authorize("SUPER_ADMIN"));

// Platform overview
router.get("/dashboard",                       superAdminController.getDashboard);

// Hospital lifecycle
router.get("/hospitals",                       superAdminController.listHospitals);
router.post("/hospitals",                      superAdminController.addHospital);
router.put("/hospitals/:id/plan",              superAdminController.updatePlan);
router.delete("/hospitals/:id",                superAdminController.removeHospital);

// Cross-hospital visibility
router.get("/doctors",                         superAdminController.listDoctors);
router.get("/patients",                        superAdminController.listPatients);
router.get("/payments",                        superAdminController.listPayments);
router.get("/appointments",                    superAdminController.listAppointments);

module.exports = router;
