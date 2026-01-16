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

    static toPlainObject(person) {
        return { ...new PersonDTO(person) };
    }
}

module.exports = PersonDTO;