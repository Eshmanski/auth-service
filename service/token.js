const PersonDTO = require('../dtos/personDTO');
const db = require('../plugins/DB/Postgres');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');


class TokenService {
    generateTokensPack(payload) {
        const jti = uuid.v4();

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ ...payload, jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return { jti, accessToken, refreshToken };
    }

    async saveToken(personId, refreshToken, device) {
        let token = new Token({ personId, refreshToken }, device);
        const dbToken = await this.findToken(personId, device);

        if (dbToken) await db.updateToken(token);
        else token = await db.createToken(token);

        return token;
    }

    async removeToken(refreshToken) {
        const token = await db.deleteToken(refreshToken);
        return token;
    }

    validateAccessToken(token) {
        try {
            const personDTO = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return personDTO;
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const personDTO = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return personDTO;
        } catch (error) {
            return null;
        }
    }

    async createTokenAndSave(person, device) {
        const tokens = this.generateTokens(PersonDTO.toPlainObject(person));
        await this.saveToken(person.id, tokens.refreshToken, device);
        return tokens;
    }
    
    async findToken(personId, device) {
        const token = await db.findToken(personId, device);
        return token;
    }

}

module.exports = new TokenService();