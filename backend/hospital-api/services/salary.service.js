const salaryModel = require("../models/salary.model");
const userModel = require("../models/user.model");
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
    return salaryModel.getNetEarningsByDoctor(doctorId);
};

module.exports = {
    addTransaction,
    getTransactionsByDoctor,
    getAllTransactions,
    getEarnings
};