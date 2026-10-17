const salaryService = require("../services/salary.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const addTransaction = wrap(async (req, res) => {
    const data = await salaryService.addTransaction(req.body);
    return success(res, 201, "Salary transaction added", data);
});

const getDoctorTransactions = wrap(async (req, res) => {
    const data = await salaryService.getTransactionsByDoctor(
        Number(req.params.doctorId || req.user.id)
    );
    return success(res, 200, "Salary transactions fetched", data);
});

const getMyEarnings = wrap(async (req, res) => {
    const data = await salaryService.getEarnings(req.user.id);
    return success(res, 200, "Earnings summary fetched", data);
});

const getAllTransactions = wrap(async (req, res) => {
    const data = await salaryService.getAllTransactions();
    return success(res, 200, "All salary transactions fetched", data);
});

module.exports = {
    addTransaction,
    getDoctorTransactions,
    getMyEarnings,
    getAllTransactions
};