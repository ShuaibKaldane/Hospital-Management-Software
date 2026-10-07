const authService = require("../services/auth.service");

const adminLogin = async (req, res) => {
    try {

        const result = await authService.adminLogin(req.body);

        return res.status(result.status).json(result);

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

module.exports = {
    adminLogin
};