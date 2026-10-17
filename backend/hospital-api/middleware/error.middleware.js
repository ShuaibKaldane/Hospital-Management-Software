/**
 * Centralized error handler.
 * Catches anything passed via next(err) or thrown.
 */
const errorHandler = (err, req, res, next) => {
    console.error("🔥 Error:", err.message);

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    return res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = errorHandler;