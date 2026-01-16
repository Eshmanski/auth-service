const emailToLowerCase = (req, _, next) => {
	if (req.body.email) req.body.email = req.body.email.toLowerCase();
	next();
};

module.exports = emailToLowerCase;
