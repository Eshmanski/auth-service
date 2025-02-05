const ApiError = require('../Errors/api');


function errorMiddlewares(err, req, res, next) {
    console.log(err);

    if (err instanceof ApiError) {
        return res.status(err.status).json( { message: err.message, errors: err.errors } );
    }

    return res.status(500).json(err);
}

module.exports = errorMiddlewares;