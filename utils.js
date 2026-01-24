const crypto = require("crypto");

const getViewPath = (name, type) => {
	if (type === 'mobile') return `mobile/${name}`;
	else if (type  === 'desktop') return `desktop/${name}`;
}

const toHashToken = (token) => {
	return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { toHashToken, getViewPath };