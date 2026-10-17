/**
 * Lightweight custom error class so services can throw
 * structured errors that the error middleware understands.
 */
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

module.exports = ApiError;