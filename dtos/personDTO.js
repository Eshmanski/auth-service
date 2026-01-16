class PersonDTO {
	id
	email;
	superuser;
	isActivated;

	constructor(person) {
		this.id = person.id;
		this.email = person.email;
		this.superuser = person.superuser;
		this.isActivated = person.is_activated;
	}

	static toPlainObject(person, additionalObj = {}) {
		return { ...new PersonDTO(person), ...additionalObj };
	}

	static toPayloadAT(person) {
		return this.toPlainObject(person);
	}

	static toPayloadRT(jti, person) {
		return this.toPlainObject(person, { jti });
	}
}

module.exports = PersonDTO;