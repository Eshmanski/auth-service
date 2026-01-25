const personService = require('../service/person');
const tokenService = require('../service/token');
const ApiError = require("../errors/api");
const config = require('../config');

const authMiddleware = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;
		if (!accessToken) return next(ApiError.UnauthorizedError());

		const personToken = tokenService.validateAccessToken(accessToken);
		if (!personToken) return next(ApiError.UnauthorizedError());

		const person = await personService.getPerson(personToken.id);
		if (!person || !person.is_activated) return next(ApiError.UnauthorizedError());

		req.person = person;
		next();
	} catch (error) {
		next(ApiError.UnauthorizedError());
	}
}

module.exports = authMiddleware;