/**
 * Restrict a route to specific roles.
 * Must be used after authenticate().
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied for your role"
            });
        }
        return next();
    };
};

module.exports = authorize;