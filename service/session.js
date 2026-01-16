const redisClient = require("../plugins/DB/Redis");
const { toHashToken } = require("../utils");

class SessionService {
	async saveSession(session, ttl) {
		await redisClient.setSession(session, ttl);
	}

	async removeSession(personId, jti) {
		await redisClient.removeSession(personId, jti);
	}

	async validateSession(personId, jti, token, device) {
		const errors = [];

		const session = await redisClient.getSession(personId, jti);

		if (!session) {
			errors.push('Session not exist');
		} else {
			const hash = toHashToken(token);

			if (session.hash_token != hash) errors.push('Hash are not equals');
			if (session.device_type != device.device_type) errors.push('Device types are not equals');
			if (session.os_name != device.os_name) errors.push('OS names are not equals');
			if (session.os_version != device.os_version) errors.push('OS versions are not equals');
			if (session.agent_name != device.agent_name) errors.push('Agent names are not equals');
			if (session.agent_version != device.agent_version) errors.push('Agent versions are not equals');
		}

		return errors;
	}
}

module.exports = new SessionService();