const ApiError = require("../errors/api");
const tokenService = require("../service/token");

function authMiddlewares(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return next(ApiError.UnauthorizedError());

    const token = authorizationHeader.split(" ")[1];
    if (!token) return next(ApiError.UnauthorizedError());

    const personDTO = tokenService.validateAccessToken(token);
    if (!personDTO) return next(ApiError.UnauthorizedError());

    req.person = personDTO;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}

module.exports = authMiddlewares;