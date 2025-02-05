class Token {
    id;
    personId;
    refreshToken;

    constructor(personId, refreshToken, id) {
        this.id = id ?? 0;
        this.personId = personId;
        this.refreshToken = refreshToken;
    }

    update(token) {
        this.refreshToken = token.refreshToken;
        return this;
    }

    static convertFromDB(dbToken) {
        const { id, person_id, refresh_token } = dbToken;
        return new Token(person_id, refresh_token, id);
    }
}

module.exports = Token;