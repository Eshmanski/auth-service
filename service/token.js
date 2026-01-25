const PersonDTO = require('../dtos/personDTO');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

class TokenService {
	generateAccessToken(person) {
		const payload = PersonDTO.toPayloadAT(person);
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });

		return accessToken;
	}
	
	generateTokensPack(person) {
		const jti = uuid.v4();

		const payloadAT = PersonDTO.toPayloadAT(person);
		const payloadRT = PersonDTO.toPayloadRT(jti, person);

		const accessToken = jwt.sign(payloadAT, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
		const refreshToken = jwt.sign(payloadRT, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

		return { jti, accessToken, refreshToken };
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

	parse(token) {
		const payload = jwt.decode(token);
		return payload;
	}
}

module.exports = new TokenService();