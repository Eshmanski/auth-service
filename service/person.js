const db = require('../plugins/DB/Postgres');
const Person = require('../models/person');
const ApiError = require('../errors/api');
const bcrypt = require('bcrypt');

class PersonService {
	async registration(personData) {
		let person = await db.findPersonByEmail(personData.email);
		if (person) throw ApiError.PersonExistError();

		person = await Person.createNewPerson(personData);
		person = await db.createPerson(person);

		return person;
	}

	async login(authData) {
		const person = await db.findPersonByEmail(authData.email);
		if (!person) throw ApiError.PersonNotExistError();

		const isPassEquals = await bcrypt.compare(authData.password, person.password);
		if (!isPassEquals) throw ApiError.WrongPasswordError();

		return person;
	}

	async activate(activationLink) {
		const person = await db.findPersonByLink(activationLink);

		if (!person) throw ApiError.PersonLinkNotExistError();

		person.is_activated = true;
		person.activation_link = '';

		await db.updatePerson(person);
	}

	async getPerson(id) {
		const person = await db.findPersonById(id);
		return person;
	}

	async getAllPersons() {
		const persons = await db.findPersonAll();
		return persons;
	}
}

module.exports = new PersonService();