const { validationResult } = require('express-validator');
const sessionService = require('../service/session');
const personService = require('../service/person');
const tokenService = require('../service/token');
const Session = require('../models/session');
const ApiError = require('../errors/api');

class PersonController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(ApiError.ValidationError(errors.array()))

      const body = req.body;
      const device = req.device;

      const person = await personService.registration(body, device);
      const tokensPack = tokenService.generateTokensPack(person) ;

      const ttlSeconds = 30 * 24 * 60 * 60;
      const { jti, accessToken, refreshToken } = tokensPack;
      const session = await Session.createSession(jti, refreshToken, person, device);

      await sessionService.saveSession(session, ttlSeconds);
      res.cookie('refreshToken', refreshToken, { maxAge: ttlSeconds * 1000, httpOnly: true });

      return res.json({ token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(ApiError.ValidationError(errors.array()))

      const body = req.body;
      const device = req.device;

      const person = await personService.login(body);
      const tokensPack = tokenService.generateTokensPack(person);

      const ttlSeconds = 30 * 24 * 60 * 60;
      const { jti, accessToken, refreshToken } = tokensPack;
      const session = await Session.createSession(jti, refreshToken, person, device);


      await sessionService.saveSession(session, ttlSeconds);
      res.cookie('refreshToken', refreshToken, { maxAge: ttlSeconds * 1000, httpOnly: true });

      return res.json({ token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const payload = tokenService.validateRefreshToken(refreshToken); 
      if (payload) await sessionService.removeSession(payload.id, payload.jti);      

      res.clearCookie('refreshToken');

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const device = req.device;
      const { refreshToken: token } = req.cookies;

      const payload = tokenService.validateRefreshToken(token);
      if (!payload) throw ApiError.UnauthorizedError('Don`t have refresh token in cookies');

      const errors = await sessionService.validateSession(payload.id, payload.jti, token, device);
      if (errors.length > 0) throw ApiError.UnauthorizedError(errors.join('\n'));

      const person = await personService.getPerson(payload.id);
      const tokensPack = tokenService.generateTokensPack(person);

      const ttlSeconds = 30 * 24 * 60 * 60;
      const { jti, accessToken, refreshToken } = tokensPack;
      const session = await Session.createSession(jti, refreshToken, person, device);

      await sessionService.saveSession(session, ttlSeconds);
      res.cookie('refreshToken', refreshToken, { maxAge: ttlSeconds * 1000, httpOnly: true });

      await sessionService.removeSession(payload.id, payload.jti);

      return res.json({ token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await personService.activate(activationLink);

      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const { id } = req.person;
      const person = await personService.getPerson(id);

      return res.json(person);
    } catch {
      next(error);
    }
  }

  async getPersons(req, res, next) {
    try {
      const persons = await personService.getAllPersons();
      return res.json(persons);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PersonController();