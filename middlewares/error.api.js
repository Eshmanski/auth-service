const ApiError = require('../errors/api');


function errorAPIMiddlewares(err, req, res, next) {
	console.log(err);

	if (err instanceof ApiError) {
		return res.status(err.status).json(err.getErrorDTO());
	} else {
		const apiError = ApiError.UnexpectedError([err])
		return res.status(apiError.status).json(apiError.getErrorDTO());
	}
}

module.exports = errorAPIMiddlewares;