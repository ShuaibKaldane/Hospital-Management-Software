/**
 * Tiny validation helpers. Throw ApiError on failure.
 */
const ApiError = require("./error.util");

const isEmail = (value) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isNonEmptyString = (value, field) => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new ApiError(400, `${field} is required`);
    }
};

const isPositiveInt = (value, field) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
        throw new ApiError(400, `${field} must be a positive integer`);
    }
    return n;
};

const isNonNegativeNumber = (value, field) => {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) {
        throw new ApiError(400, `${field} must be a non-negative number`);
    }
    return n;
};

const requireFields = (obj, fields) => {
    for (const field of fields) {
        if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
            throw new ApiError(400, `${field} is required`);
        }
    }
};

module.exports = {
    isEmail,
    isNonEmptyString,
    isPositiveInt,
    isNonNegativeNumber,
    requireFields
};