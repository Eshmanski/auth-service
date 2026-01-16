const uuid = require('uuid');
const bcrypt = require('bcrypt');

class Person {
    id;
    nickname;
    email;
    password;
    superuser;
    is_activated;
    activation_link;

    constructor(obj) {
        this.id = obj.id ?? 0;
        this.nickname = obj.nickname ?? 'Unknown';
        this.email = obj.email ?? 'Unknown';
        this.password = obj.password ?? 'Unknown';
        this.is_activated = obj.is_activated ?? false;
        this.activation_link = obj.activation_link ?? '';
    }

    static async createNewPerson(personData) {
        const personObj = {
            nickname: personData.nickname,
            email: personData.email,
            superuser: false,
            password: await bcrypt.hash(personData.password, 3),
            is_activated: false,
            activation_link: uuid.v4()
        }

        return new Person(personObj);
    }

    static convertFromDB(dbPerson) {
        return new Person(dbPerson);
    }
}

module.exports = Person;