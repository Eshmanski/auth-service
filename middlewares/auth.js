const ApiError = require("../errors/api");
const tokenService = require("../service/token");

function authMiddlewares(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return next(ApiError.UnauthorizedError());

    const token = authorizationHeader.split(" ")[1];
    if (!token) return next(ApiError.UnauthorizedError());

    const person = tokenService.validateAccessToken(token);
    if (!person || !person.isActivated) return next(ApiError.UnauthorizedError());

    req.person = person;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}

module.exports = authMiddlewares;