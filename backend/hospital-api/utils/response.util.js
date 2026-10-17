/**
 * Standard JSON response helpers used across services/controllers.
 */

const success = (res, status, message, data = null) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

const failure = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};

module.exports = { success, failure };