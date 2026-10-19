const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const adminController = require("../controllers/admin.controller");
const categoryController = require("../controllers/doctorCategory.controller");
const salaryController = require("../controllers/salary.controller");
const appointmentController = require("../controllers/appointment.controller");
const paymentController = require("../controllers/payment.controller");

// All admin endpoints require JWT + ADMIN role.
// (SUPER_ADMIN has its own router.)
router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard",         adminController.getDashboard);

// Doctors
router.get("/doctors",            adminController.listDoctors);
router.put("/doctors/:id/approve", adminController.approveDoctor);
router.put("/doctors/:id/block",  adminController.blockDoctor);
router.post("/doctors",           adminController.addDoctor);

// Patients
router.get("/patients",           adminController.listPatients);
router.post("/patients",          adminController.addPatient);

// Doctor categories — ADMIN can view + create/update/delete for their hospital.
router.get("/categories",          categoryController.listCategories);
router.post("/categories",         categoryController.createCategory);
router.put("/categories/:id",      categoryController.updateCategory);
router.delete("/categories/:id",   categoryController.deleteCategory);

// Appointments (own hospital only)
router.get("/appointments",                  appointmentController.listAllAppointments);
router.put("/appointments/:id/status",       appointmentController.updateStatus);

// Salary management
router.post("/salary",                  salaryController.addTransaction);
router.get("/salary",                   salaryController.getAllTransactions);
router.get("/salary/doctor/:doctorId",  salaryController.getDoctorTransactions);

// Payments
router.get("/payments",              paymentController.getAllPayments);
router.put("/payments/:id/status",   paymentController.updatePaymentStatus);

module.exports = router;
