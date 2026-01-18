const crypto = require("crypto");

toHashToken = (token) => {
	return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { toHashToken };