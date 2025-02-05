class Token {
    id;
    person_id;
    refresh_token;
    device;

    constructor({ id, personId, refreshToken }, device) {
        this.id = id ?? 0;
        this.person_id = personId;
        this.refresh_token = refreshToken;
        this.device = device;
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