const pool = require("../config/database");

const create = async ({
    appointment_id,
    patient_id,
    doctor_id,
    hospital_id = null,
    report_name,
    file_path
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
        `INSERT INTO patient_reports
            (appointment_id, patient_id, doctor_id, hospital_id, report_name, file_path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [appointment_id, patient_id, doctor_id, resolvedHospitalId, report_name, file_path]
    );

    return result.insertId;
};

const findByPatient = async (patientId) => {
    const [rows] = await pool.execute(
        `SELECT
            r.id,
            r.appointment_id,
            r.patient_id,
            r.doctor_id,
            r.hospital_id,
            h.name AS hospital_name,
            r.report_name,
            r.file_path,
            r.uploaded_at,
            d.name AS doctor_name
         FROM patient_reports r
         JOIN users d ON d.id = r.doctor_id
         LEFT JOIN hospitals h ON h.id = r.hospital_id
         WHERE r.patient_id = ?
         ORDER BY r.uploaded_at DESC`,
        [patientId]
    );

    return rows;
};

const findByDoctor = async (doctorId) => {
    const [rows] = await pool.execute(
        `SELECT
            r.id,
            r.appointment_id,
            r.patient_id,
            r.doctor_id,
            r.hospital_id,
            h.name AS hospital_name,
            r.report_name,
            r.file_path,
            r.uploaded_at,
            p.name AS patient_name
         FROM patient_reports r
         JOIN users p ON p.id = r.patient_id
         LEFT JOIN hospitals h ON h.id = r.hospital_id
         WHERE r.doctor_id = ?
         ORDER BY r.uploaded_at DESC`,
        [doctorId]
    );

    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM patient_reports WHERE id = ? LIMIT 1`,
        [id]
    );

    return rows[0];
};

module.exports = {
    create,
    findByPatient,
    findByDoctor,
    findById
};
