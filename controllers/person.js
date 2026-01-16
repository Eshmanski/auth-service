const { validationResult } = require('express-validator');
const sessionService = require('../service/session');
const personService = require('../service/person');
const tokenService = require('../service/token');
const PersonDTO = require('../dtos/personDTO');
const Session = require('../models/session');
const ApiError = require('../Errors/api');

class PersonController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return next(ApiError.ValidationError(errors.array())) 

            const body = req.body;
            const device = req.device;

            const person = await personService.registration(body, device);
            const tokensPack = tokenService.generateTokensPack(PersonDTO.toPlainObject(person));

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
            const personData = await personService.login(req.body, req.device);
            res.cookie('refreshToken', personData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(personData);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await personService.logout(refreshToken);
            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await personService.activate(activationLink);

            return res.redirect(process.env.CLIENT_URL)
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const personData = await personService.refresh(refreshToken, req.device);
            res.cookie('refreshToken', personData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(personData);
        } catch (error) {
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