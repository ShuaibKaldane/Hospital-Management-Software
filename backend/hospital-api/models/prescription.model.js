const pool = require("../config/database");

/**
 * Create prescription — `hospital_id` is taken from the doctor.
 */
const create = async ({
    appointment_id,
    doctor_id,
    patient_id,
    hospital_id = null,
    diagnosis,
    medicines,
    advice
}) => {
    let resolvedHospitalId = hospital_id;
    if (!resolvedHospitalId) {
        const [rows] = await pool.execute(
            `SELECT hospital_id FROM users WHERE id = ? LIMIT 1`,
            [doctor_id]
        );
        resolvedHospitalId = rows[0]?.hospital_id || null;
    }

    const [result] = await pool.execute(
        `INSERT INTO prescriptions
            (appointment_id, doctor_id, patient_id, hospital_id, diagnosis, medicines, advice)
         VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
        [
            appointment_id,
            doctor_id,
            patient_id,
            resolvedHospitalId,
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
            p.hospital_id,
            h.name AS hospital_name,
            p.diagnosis,
            p.medicines,
            p.advice,
            p.created_at,
            d.name AS doctor_name,
            pt.name AS patient_name
         FROM prescriptions p
         JOIN users d  ON d.id  = p.doctor_id
         JOIN users pt ON pt.id = p.patient_id
         LEFT JOIN hospitals h ON h.id = p.hospital_id
         WHERE p.id = ?
         LIMIT 1`,
        [id]
    );

    if (rows[0]) {
        if (typeof rows[0].medicines === "string") {
            try { rows[0].medicines = JSON.parse(rows[0].medicines); } catch (_) { /* noop */ }
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
            p.hospital_id,
            h.name AS hospital_name,
            p.diagnosis,
            p.medicines,
            p.advice,
            p.created_at,
            pt.name AS patient_name
         FROM prescriptions p
         JOIN users pt ON pt.id = p.patient_id
         LEFT JOIN hospitals h ON h.id = p.hospital_id
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
            p.hospital_id,
            h.name AS hospital_name,
            p.diagnosis,
            p.medicines,
            p.advice,
            p.created_at,
            d.name AS doctor_name
         FROM prescriptions p
         JOIN users d ON d.id = p.doctor_id
         LEFT JOIN hospitals h ON h.id = p.hospital_id
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
