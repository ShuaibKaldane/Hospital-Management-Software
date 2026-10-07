const pool = require("../config/database");

/**
 * Find a user by email.
 * Used for admin, doctor and patient login.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            id,
            name,
            email,
            password,
            role,
            status
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [email]);

    return rows[0];
};

module.exports = {
    findUserByEmail
};