const express = require("express");
const cors = require("cors");
require("dotenv").config();

const errorHandler = require("./middleware/error.middleware");

const authRoutes         = require("./routes/auth.routes");
const adminRoutes        = require("./routes/admin.routes");
const doctorRoutes       = require("./routes/doctor.routes");
const patientRoutes      = require("./routes/patient.routes");
const categoryRoutes     = require("./routes/doctorCategory.routes");
const trialRoutes        = require("./routes/trial.routes");

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get("/", (req, res) => {
    res.send("🏥 Hospital API Running...");
});

// --- API routes ---
app.use("/api/auth",              authRoutes);
app.use("/api/admin",             adminRoutes);
app.use("/api/doctor",            doctorRoutes);
app.use("/api/patient",           patientRoutes);
app.use("/api/doctor-categories", categoryRoutes);
app.use("/api/trial",             trialRoutes);

// --- 404 handler ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// --- Centralized error handler (must be last) ---
app.use(errorHandler);

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Hospital API running on port ${PORT}`);
});

module.exports = app;