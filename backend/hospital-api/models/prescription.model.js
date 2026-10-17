const pool = require("../config/database");

const create = async ({
    appointment_id,
    doctor_id,
    patient_id,
    diagnosis,
    medicines,
    advice
}) => {
    const [result] = await pool.execute(
        `INSERT INTO prescriptions
            (appointment_id, doctor_id, patient_id, diagnosis, medicines, advice)
         VALUES (?, ?, ?, ?, CAST(? AS JSON), ?)`,
        [
            appointment_id,
            doctor_id,
            patient_id,
            diagnosis,
            JSON.stringify(medicines),
            advice || null
        ]
    );

    return result.insertId;
};

const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT
            p.id,
            p.appointment_id,
            p.doctor_id,
            p.patient_id,
            p.diagnosis,
            p.medicines,
            p.advice,
            p.created_at,
            d.name AS doctor_name,
            pt.name AS patient_name
         FROM prescriptions p
         JOIN users d  ON d.id  = p.doctor_id
         JOIN users pt ON pt.id = p.patient_id
         WHERE p.id = ?
         LIMIT 1`,
        [id]
    );

    if (rows[0]) {
        // mysql2 sometimes auto-parses JSON columns; normalize.
        if (typeof rows[0].medicines === "string") {
            try {
                rows[0].medicines = JSON.parse(rows[0].medicines);
            } catch (_) { /* leave as-is */ }
        }
    }

    return rows[0];
};

const findByDoctor = async (doctorId) => {
    const [rows] = await pool.execute(
        `SELECT
            p.id,
            p.appointment_id,
            p.patient_id,
            p.diagnosis,
            p.medicines,
            p.advice,
            p.created_at,
            pt.name AS patient_name
         FROM prescriptions p
         JOIN users pt ON pt.id = p.patient_id
         WHERE p.doctor_id = ?
         ORDER BY p.created_at DESC`,
        [doctorId]
    );

    return rows;
};

const findByPatient = async (patientId) => {
    const [rows] = await pool.execute(
        `SELECT
            p.id,
            p.appointment_id,
            p.doctor_id,
            p.diagnosis,
            p.medicines,
            p.advice,
            p.created_at,
            d.name AS doctor_name
         FROM prescriptions p
         JOIN users d ON d.id = p.doctor_id
         WHERE p.patient_id = ?
         ORDER BY p.created_at DESC`,
        [patientId]
    );

    return rows;
};

module.exports = {
    create,
    findById,
    findByDoctor,
    findByPatient
};