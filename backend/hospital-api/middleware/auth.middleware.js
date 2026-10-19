const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Verify JWT from Authorization header.
 * Attaches decoded payload to req.user (id, role, hospital_id).
 */
const authenticate = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role,
            hospital_id: decoded.hospital_id ?? null
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;
