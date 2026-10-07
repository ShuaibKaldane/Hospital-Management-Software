const authModel = require("../models/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLogin = async (data) => {

    const { email, password } = data;

    const user = await authModel.findUserByEmail(email);

    if (!user) {
        return {
            status: 404,
            success: false,
            message: "User not found"
        };
    }
    // Check role
    if (user.role !== "ADMIN") {
        return {
            status: 403,
            success: false,
            message: "Access Denied"
        };
    }
     // Check account status
    if (user.status !== "ACTIVE") {
        return {
            status: 403,
            success: false,
            message: "Account is not active"
        };
    }
     // Compare Password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return {
            status: 401,
            success: false,
            message: "Invalid Email or Password"
        };
    }
      // Generate JWT
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    return {
        status: 200,
        success: true,
        message: "Login Sucessful",
        token,
        user : {
             id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

module.exports = {
    adminLogin
};