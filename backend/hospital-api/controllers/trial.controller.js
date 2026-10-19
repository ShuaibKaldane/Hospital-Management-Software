const trialService = require("../services/trial.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const activateTrial = wrap(async (req, res) => {
    const result = await trialService.activateTrial(req.body);
    return success(res, 201, "Trial activated. Save the password — it is shown only once.", {
        adminEmail:     result.adminEmail,
        adminPassword:  result.adminPassword,
        hospitalId:     result.hospitalId,
        hospitalName:   result.hospitalName,
        trialExpiresAt: result.trialExpiresAt,
        loginUrl:       result.loginUrl
    });
});

module.exports = {
    activateTrial
};
