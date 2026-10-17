const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const doctorController = require("../controllers/doctorProfile.controller");
const categoryController = require("../controllers/doctorCategory.controller");
const appointmentController = require("../controllers/appointment.controller");
const prescriptionController = require("../controllers/prescription.controller");
const reportController = require("../controllers/patientReport.controller");
const paymentController = require("../controllers/payment.controller");
const salaryController = require("../controllers/salary.controller");
const upload = require("../middleware/upload.middleware");

router.use(authenticate, authorize("DOCTOR"));

// Profile
router.get("/profile",  doctorController.getMyProfile);
router.put("/profile",  doctorController.updateMyProfile);

// Lookups
router.get("/categories",        categoryController.listCategories);
router.get("/doctors",           doctorController.listAllDoctors);
router.get("/doctors/:id",       doctorController.getDoctorById);

// Appointments
router.get("/appointments",                appointmentController.getMyAppointments);
router.put("/appointments/:id/status",     appointmentController.updateStatus);

// Prescriptions
router.post("/prescriptions",              prescriptionController.createPrescription);
router.get("/prescriptions",               prescriptionController.getMyPrescriptions);

// Reports (doctor can view patient-uploaded reports)
router.get("/reports",                     reportController.getMyReports);

// Earnings / Payments
router.get("/payments",                    paymentController.getMyPayments);
router.get("/earnings",                    salaryController.getMyEarnings);
router.get("/salary",                      salaryController.getDoctorTransactions);

module.exports = router;