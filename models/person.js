const uuid = require('uuid');


class Person {
    id;
    nickname;
    email;
    password;
    isActivated;
    activationLink;

    constructor(nickname, email, password, isActivated, activationLink, id) {
        this.id = id ?? 0;
        this.nickname = nickname;
        this.email = email;
        this.password = password;
        this.isActivated = isActivated ?? false;
        this.activationLink = activationLink ?? '';
    }

    static createNewPerson(nickname, email, password) {
        return new Person(nickname, email, password, false, uuid.v4());
    }

    static convertFromDB(dbPerson) {
        const { id, nickname, email, password, is_activated, activation_link } = dbPerson;
        return new Person(nickname, email, password, is_activated, activation_link, id);
    }
}

module.exports = Person;