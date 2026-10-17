const reportService = require("../services/patientReport.service");
const { success } = require("../utils/response.util");
const ApiError = require("../utils/error.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const uploadReport = wrap(async (req, res) => {
    if (!req.file) throw new ApiError(400, "file is required (multipart field name: file)");

    const data = await reportService.uploadReport(req.user.id, {
        appointment_id: Number(req.body.appointment_id),
        report_name: req.body.report_name || req.file.originalname,
        file_path: req.file.path
    });

    return success(res, 201, "Report uploaded", data);
});

const getMyReports = wrap(async (req, res) => {
    let data;
    if (req.user.role === "PATIENT") {
        data = await reportService.getMyReportsAsPatient(req.user.id);
    } else if (req.user.role === "DOCTOR") {
        data = await reportService.getMyReportsAsDoctor(req.user.id);
    }
    return success(res, 200, "Reports fetched", data || []);
});

module.exports = {
    uploadReport,
    getMyReports
};