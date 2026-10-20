const salaryModel = require("../models/salary.model");
const paymentModel = require("../models/payment.model");
const userModel = require("../models/user.model");
const pool = require("../config/database");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");

const addTransaction = async (data) => {
    validators.requireFields(data, ["doctor_id", "amount", "transaction_type"]);

    const doctorId = validators.isPositiveInt(data.doctor_id, "doctor_id");
    const amount = validators.isNonNegativeNumber(data.amount, "amount");

    const allowed = ["Salary", "Bonus", "Deduction"];
    if (!allowed.includes(data.transaction_type)) {
        throw new ApiError(400, "Invalid transaction_type");
    }

    const doctor = await userModel.findUserById(doctorId);
    if (!doctor || doctor.role !== "DOCTOR") {
        throw new ApiError(404, "Doctor not found");
    }

    const id = await salaryModel.create({
        doctor_id: doctorId,
        amount,
        transaction_type: data.transaction_type,
        reason: data.reason
    });

    const [created] = await salaryModel.findByDoctor(doctorId);
    return created;
};

const getTransactionsByDoctor = async (doctorId) => {
    return salaryModel.findByDoctor(doctorId);
};

const getAllTransactions = async () => {
    return salaryModel.findAll();
};

const getEarnings = async (doctorId) => {
    const [salaryRows] = await pool.execute(
        `SELECT
            COALESCE(SUM(CASE WHEN transaction_type IN ('Salary','Bonus') THEN amount ELSE 0 END), 0) AS salaryCredits,
            COALESCE(SUM(CASE WHEN transaction_type = 'Deduction' THEN amount ELSE 0 END), 0) AS salaryDebits
         FROM doctor_salary_transactions
         WHERE doctor_id = ?`,
        [doctorId]
    );

    const [payRows] = await pool.execute(
        `SELECT COALESCE(SUM(amount), 0) AS consultation
         FROM payments
         WHERE doctor_id = ? AND payment_status = 'Paid'`,
        [doctorId]
    );

    const salaryCredits = Number(salaryRows[0]?.salaryCredits || 0);
    const salaryDebits  = Number(salaryRows[0]?.salaryDebits  || 0);
    const consultation  = Number(payRows[0]?.consultation      || 0);

    return {
        credits:      salaryCredits + consultation,
        debits:       salaryDebits,
        salaryCredits,
        consultation,
        net:          salaryCredits + consultation - salaryDebits
    };
};

/**
 * Combined transaction history: salary/bonus/deduction entries plus each
 * paid consultation payment as a `Consultation` row.
 */
const getMyTransactions = async (doctorId) => {
    const salaryRows = await salaryModel.findByDoctor(doctorId);
    const [paidPays] = await pool.execute(
        `SELECT
            pay.id,
            pay.appointment_id,
            pay.amount,
            pay.payment_method,
            pay.paid_at,
            p.name  AS patient_name,
            a.appointment_date
         FROM payments pay
         JOIN users p        ON p.id = pay.patient_id
         LEFT JOIN appointments a ON a.id = pay.appointment_id
         WHERE pay.doctor_id = ? AND pay.payment_status = 'Paid'
         ORDER BY pay.paid_at DESC`,
        [doctorId]
    );

    const salaryRowsNorm = salaryRows.map(r => ({
        id:              `sal-${r.id}`,
        amount:          r.amount,
        transaction_type: r.transaction_type,
        reason:          r.reason || null,
        created_at:      r.created_at,
        source:          'salary'
    }));

    const paymentRows = paidPays.map(p => ({
        id:              `pay-${p.id}`,
        amount:          p.amount,
        transaction_type: 'Consultation',
        patient_name:    p.patient_name || null,
        reason:          p.patient_name
            ? `${p.patient_name} · ${p.payment_method}${p.appointment_id ? ` · appt #${p.appointment_id}` : ''}`
            : `${p.payment_method} payment${p.appointment_id ? ` · appt #${p.appointment_id}` : ''}`,
        created_at:      p.paid_at,
        source:          'payment'
    }));

    return [...salaryRowsNorm, ...paymentRows]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

module.exports = {
    addTransaction,
    getTransactionsByDoctor,
    getAllTransactions,
    getEarnings,
    getMyTransactions
};