const pool = require("../config/database");

const create = async ({ doctor_id, patient_id, appointment_date, appointment_time }) => {
    const [result] = await pool.execute(
        `INSERT INTO appointments
            (doctor_id, patient_id, appointment_date, appointment_time, status)
         VALUES (?, ?, ?, ?, 'Pending')`,
        [doctor_id, patient_id, appointment_date, appointment_time]
    );

    return result.insertId;
};

/**
 * Check if a slot is already booked for the given doctor.
 */
const isSlotTaken = async (doctorId, date, time) => {
    const [rows] = await pool.execute(
        `SELECT id FROM appointments
         WHERE doctor_id = ?
           AND appointment_date = ?
           AND appointment_time = ?
           AND status <> 'Cancelled'
         LIMIT 1`,
        [doctorId, date, time]
    );

    return rows.length > 0;
};

const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.created_at,
            a.doctor_id,
            a.patient_id,
            d.name  AS doctor_name,
            p.name  AS patient_name
         FROM appointments a
         JOIN users d ON d.id = a.doctor_id
         JOIN users p ON p.id = a.patient_id
         WHERE a.id = ?
         LIMIT 1`,
        [id]
    );

    return rows[0];
};

const findByDoctor = async (doctorId, { status } = {}) => {
    const params = [doctorId];
    let where = "a.doctor_id = ?";

    if (status) {
        where += " AND a.status = ?";
        params.push(status);
    }

    const [rows] = await pool.execute(
        `SELECT
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.created_at,
            a.patient_id,
            p.name AS patient_name,
            p.email AS patient_email
         FROM appointments a
         JOIN users p ON p.id = a.patient_id
         WHERE ${where}
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        params
    );

    return rows;
};

const findByPatient = async (patientId, { status } = {}) => {
    const params = [patientId];
    let where = "a.patient_id = ?";

    if (status) {
        where += " AND a.status = ?";
        params.push(status);
    }

    const [rows] = await pool.execute(
        `SELECT
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.created_at,
            a.doctor_id,
            d.name AS doctor_name,
            dc.category_name
         FROM appointments a
         JOIN users d ON d.id = a.doctor_id
         LEFT JOIN doctor_profiles dp ON dp.user_id = d.id
         LEFT JOIN doctor_categories dc ON dc.id = dp.category_id
         WHERE ${where}
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        params
    );

    return rows;
};

const findAll = async ({ status, date } = {}) => {
    const where = [];
    const params = [];

    if (status) {
        where.push("a.status = ?");
        params.push(status);
    }
    if (date) {
        where.push("a.appointment_date = ?");
        params.push(date);
    }

    const sql = `
        SELECT
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.created_at,
            a.doctor_id,
            a.patient_id,
            d.name AS doctor_name,
            p.name AS patient_name
        FROM appointments a
        JOIN users d ON d.id = a.doctor_id
        JOIN users p ON p.id = a.patient_id
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
};

const updateStatus = async (id, status) => {
    const [result] = await pool.execute(
        `UPDATE appointments SET status = ? WHERE id = ?`,
        [status, id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    create,
    isSlotTaken,
    findById,
    findByDoctor,
    findByPatient,
    findAll,
    updateStatus
};