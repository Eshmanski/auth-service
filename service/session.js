const redisClient = require("../plugins/DB/Redis");

class SessionService {
    async saveSession(session, ttl) {
        await redisClient.setSession(session, ttl);
    }

    removeSession(userId, jti) {

    }

    getSession(userId, jti) {

    }
} 

module.exports = new SessionService();