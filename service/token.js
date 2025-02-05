const db = require('../plugins/DB/Postgres');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30s' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return { accessToken, refreshToken };
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

    async createTokenAndSave(personId, device) {
        const tokens = this.generateTokens({ id: personId });
        await this.saveToken(personId, tokens.refreshToken, device);
        return tokens;
    }
    
    async findToken(personId, device) {
        const token = await db.findToken(personId, device);
        return token;
    }

}

module.exports = new TokenService();