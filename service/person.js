const ApiError = require('../Errors/api');
const PersonDTO = require('../dtos/personDTO');
const db = require('../plugins/DB/Postgres');
const Person = require('../models/person');
const tokenService = require('./token');
const mailService = require('./mail');
const bcrypt = require('bcrypt');

class PersonService {
    async registration(personData, device) {
        const person = await db.findPersonByEmail(personData.email);
        if (person) throw ApiError.PersonExistError();

        let newPerson = await Person.createNewPerson(personData);
        newPerson = await db.createPerson(newPerson);

        await mailService.sendActivationMail(personData.email, `${process.env.API_URL}/api/activate/${newPerson.activation_link}`);

        return tokenService.createTokenAndSave(person.id, device);
    }

    async activate(activationLink) {
        const person = await db.findPersonByLink(activationLink);

        if (!person) throw ApiError.PersonLinkNotExistError();

        person.is_activated = true;
        person.activation_link = '';

        await db.updatePerson(person);
    }

    async login(authData, device) {
        const person = await db.findPersonByEmail(authData.email);
        if (!person) throw ApiError.PersonNotExistError();

        const isPassEquals = await bcrypt.compare(authData.password, person.password);
        if (!isPassEquals) throw ApiError.WrongPasswordError();

        return tokenService.createTokenAndSave(person.id, device);
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken, device) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const { id } = tokenService.validateRefreshToken(refreshToken);
        const token = await tokenService.findToken(id, device);

        if (!id || !token) throw ApiError.UnauthorizedError();

        const person = await db.findPersonById(id);

        return tokenService.createTokenAndSave(person.id, device);
    }

    async getAllPersons() {
        const persons = await db.findPersonAll();
        return persons;
    }
}

module.exports = new PersonService();