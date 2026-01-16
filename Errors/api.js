class ApiError extends Error {
    type;
    code;
    status;
    errors = [];

    constructor(message, type, code, status, errors = []) {
        super(`Person Error ${type}: ${message}`);

        this.type = type;
        this.code = code;
        this.status = status;
        this.errors = errors;
    }

    getErrorDTO() {
        return {
            message: this.message, 
            type: this.type, 
            code: this.code, 
            errors: this.errors
        }
    }

    static PersonExistError() {
        return new ApiError('Person already exist', 'exist', 7, 409);
    }

    static PersonLinkNotExistError() {
        return new ApiError('Person activation link not exist', 'link_not_exist', 6, 404);
    }

    static PersonNotExistError() {
        return new ApiError('Person not exist', 'not_exist', 5, 404);
    }

    static WrongPasswordError() {
        return new ApiError('Wrong password', 'wrong_password', 4, 401);
    }

    static UnauthorizedError() {
        return new ApiError('Unauthorized', 'unauthorized', 3, 401);
    }

    static ValidationError(errors = []) {
        return new ApiError('Validation error', 'valid_error', 2, 400, errors);
    }

    static BadRequestError(message, errors = []) {
        return new ApiError(message, 'bad_request', 1, 400, errors);
    }

    static UnexpectedError(errors = []) {
        return new ApiError('Unexpected error', 'unexpected_error', 0, 500, errors)
    }
}

module.exports = ApiError;