const pool = require("../config/database");

const findAll = async () => {
    const [rows] = await pool.execute(
        `SELECT id, category_name, description, created_at
         FROM doctor_categories
         ORDER BY category_name ASC`
    );

    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT id, category_name, description, created_at
         FROM doctor_categories
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return rows[0];
};

const findByName = async (name) => {
    const [rows] = await pool.execute(
        `SELECT id FROM doctor_categories WHERE category_name = ? LIMIT 1`,
        [name]
    );

    return rows[0];
};

const create = async ({ category_name, description }) => {
    const [result] = await pool.execute(
        `INSERT INTO doctor_categories (category_name, description)
         VALUES (?, ?)`,
        [category_name, description || null]
    );

    return result.insertId;
};

const update = async (id, { category_name, description }) => {
    const [result] = await pool.execute(
        `UPDATE doctor_categories
         SET category_name = ?, description = ?
         WHERE id = ?`,
        [category_name, description || null, id]
    );

    return result.affectedRows > 0;
};

const remove = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM doctor_categories WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    findAll,
    findById,
    findByName,
    create,
    update,
    remove
};