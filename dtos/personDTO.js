class PersonDTO {
    id
    email;
    isActivated;

    constructor(person) {
        this.id = person.id;
        this.email = person.email;
        this.isActivated = person.is_activated;
    }

    static toPlainObject(person) {
        return { ...new PersonDTO(person) };
    }
}

module.exports = PersonDTO;