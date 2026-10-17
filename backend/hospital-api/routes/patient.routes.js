const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const patientController = require("../controllers/patientProfile.controller");
const categoryController = require("../controllers/doctorCategory.controller");
const doctorController = require("../controllers/doctorProfile.controller");
const appointmentController = require("../controllers/appointment.controller");
const prescriptionController = require("../controllers/prescription.controller");
const reportController = require("../controllers/patientReport.controller");
const paymentController = require("../controllers/payment.controller");
const upload = require("../middleware/upload.middleware");

router.use(authenticate, authorize("PATIENT"));

// Profile
router.get("/profile",  patientController.getMyProfile);
router.put("/profile",  patientController.updateMyProfile);

// Lookups
router.get("/categories",  categoryController.listCategories);
router.get("/doctors",     doctorController.listAllDoctors);
router.get("/doctors/:id", doctorController.getDoctorById);

// Appointments
router.post("/appointments",             appointmentController.bookAppointment);
router.get("/appointments",              appointmentController.getMyAppointments);

// Prescriptions
router.get("/prescriptions",             prescriptionController.getMyPrescriptions);

// Reports (file upload via multipart/form-data)
router.post("/reports", upload.single("file"), reportController.uploadReport);
router.get("/reports",                   reportController.getMyReports);

// Payments
router.post("/payments",                 paymentController.makePayment);
router.get("/payments",                  paymentController.getMyPayments);

module.exports = router;