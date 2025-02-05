const ApiError = require('../Errors/api');
const PersonDTO = require('../dtos/personDTO');
const db = require('../plugins/DB/Postgres');
const Person = require('../models/person');
const tokenService = require('./token');
const mailService = require('./mail');
const bcrypt = require('bcrypt');

class PersonService {
    async registration(nickname, email, password) {
        const person = await db.findPersonByEmail(email);
        if (person) throw ApiError.PersonExistError();

        const passHash = await bcrypt.hash(password, 3);
        let newPerson = Person.createNewPerson(nickname, email, passHash);
        newPerson = await db.createPerson(newPerson);

        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${newPerson.activationLink}`);

        const personDTO = new PersonDTO(newPerson);
        const tokens = tokenService.generateTokens({ ...personDTO });
        await tokenService.saveToken(personDTO.id, tokens.refreshToken);

        return { ...tokens, person: personDTO };
    }

    async activate(activationLink) {
        const person = await db.findPersonByLink(activationLink);

        if (!person) throw ApiError.PersonLinkNotExistError();

        person.isActivated = true;
        await db.updatePerson(person);
    }

    async login(email, password) {
        const person = await db.findPersonByEmail(email);
        if (!person) throw ApiError.PersonNotExistError();

        const isPassEquals = await bcrypt.compare(password, person.password);
        if (!isPassEquals) throw ApiError.WrongPasswordError();

        const personDTO = new PersonDTO(person);
        const tokens = tokenService.generateTokens({ ...personDTO });

        await tokenService.saveToken(personDTO.id, tokens.refreshToken);

        return { ...tokens, person: personDTO };
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const { id } = tokenService.validateRefreshToken(refreshToken);
        const token = await tokenService.findToken(refreshToken);

        if (!id || !token) throw ApiError.UnauthorizedError();

        const person = await db.findPersonById(id);
        const personDTO = new PersonDTO(person);
        const tokens = tokenService.generateTokens({ ...personDTO });

        await tokenService.saveToken(personDTO.id, tokens.refreshToken);

        return { ...tokens, person: personDTO };
    }

    async getAllPersons() {
        const persons = await db.findPersonAll();
        return persons;
    }
}

module.exports = new PersonService();