const ApiError = require('../errors/api');


function errorPAGEMiddlewares(err, req, res, next) {
    console.log(err);

    return res.status(500).json(JSON.stringify({ error: 'error' }));
}

module.exports = errorPAGEMiddlewares;