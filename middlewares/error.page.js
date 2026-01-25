const ApiError = require('../errors/api');
const config = require('../config');


function errorPAGEMiddlewares(err, req, res, next) {
    console.log(err);
    
    if (err instanceof ApiError) {
        switch (err.code) {
            case 3:
                res.clearCookie('accessToken');
                return res.redirect(config.pagePath + 'login');
            default:
                return res.status(err.status).json(err.getErrorDTO());
        }
    } else {
        const apiError = ApiError.UnexpectedError([err])
        return res.status(apiError.status).json(apiError.getErrorDTO());
    }
}

module.exports = errorPAGEMiddlewares;