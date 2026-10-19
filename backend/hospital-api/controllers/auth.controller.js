const authService = require("../services/auth.service");

const run = (handler) => async (req, res) => {
    try {
        const result = await handler(req);
        const status = result.status || 200;
        return res.status(status).json(result);
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

const superAdminLogin = run(async (req) => {
    const result = await authService.superAdminLogin(req.body);
    return { ...result, status: 200 };
});

const adminLogin = run(async (req) => {
    const result = await authService.adminLogin(req.body);
    return { ...result, status: 200 };
});

const doctorLogin = run(async (req) => {
    const result = await authService.doctorLogin(req.body);
    return { ...result, status: 200 };
});

const patientLogin = run(async (req) => {
    const result = await authService.patientLogin(req.body);
    return { ...result, status: 200 };
});

const doctorSignup = run(async (req) => {
    const data = await authService.doctorSignup(req.body);
    return { status: 201, success: true, message: data.message, data };
});

const patientSignup = run(async (req) => {
    const result = await authService.patientSignup(req.body);
    return {
        status: 201,
        success: true,
        message: result.message,
        data: { token: result.token, user: result.user }
    };
});

module.exports = {
    superAdminLogin,
    adminLogin,
    doctorLogin,
    patientLogin,
    doctorSignup,
    patientSignup
};
