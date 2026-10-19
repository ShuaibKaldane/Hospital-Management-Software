const pool = require("../config/database");

/**
 * Find a user by email.
 * Returns hospital_id so the caller can scope subsequent queries.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            id,
            name,
            email,
            password,
            role,
            status,
            hospital_id
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
