class ApiError extends Error {
    type;
    status;
    errors = [];

    constructor(message, type, status, errors = []) {
        super(`Person Error ${type}: ${message}`);
        this.type = type;
        this.status = status;
        this.errors = errors;
    }

    static PersonExistError() {
        return new ApiError('Person already exist', 'exist', 409);
    }

    static PersonLinkNotExistError() {
        return new ApiError('Person activation link not exist', 'link_not_exist', 404);
    }

    static PersonNotExistError() {
        return new ApiError('Person not exist', 'not_exist', 404);
    }

    static WrongPasswordError() {
        return new ApiError('Wrong password', 'wrong_password', 401);
    }

    static UnauthorizedError() {
        return new ApiError('Unauthorized', 'unauthorized', 401);
    }

    static BadRequestError(message, errors = []) {
        return new ApiError(message, 'bad_request', 400, errors);
    }
}

module.exports = ApiError;