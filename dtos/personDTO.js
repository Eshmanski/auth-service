class PersonDTO {
    id
    nickname;
    email;
    isActivated;

    constructor(person) {
        this.id = person.id;
        this.nickname = person.nickname;
        this.email = person.email;
        this.isActivated = person.isActivated;
    }
}

module.exports = PersonDTO;