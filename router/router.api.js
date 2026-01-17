const deviceInfoMiddleware = require('../middlewares/device');
const personController = require('../controllers/person');
const emailToLowerCase = require('../middlewares/email');
const authMiddlewares = require('../middlewares/auth');
const { body } = require('express-validator');
const Router = require('express');
const router = Router();

// Authentication routes
const authValidation = [
	body('email').isEmail(),
	body('password').isLength({ min: 6, max: 32 })
];

router.get('/check', (req, res) => res.send('Auth service is working'));

// Registration and login
router.post(
	'/registration',
	[deviceInfoMiddleware, emailToLowerCase, ...authValidation],
	personController.registration
);

router.post(
	'/login',
	[deviceInfoMiddleware, emailToLowerCase, ...authValidation],
	personController.login
);

// Session management
router.get(
	'/logout',
	[deviceInfoMiddleware],
	personController.logout
);

router.get(
	'/refresh',
	[deviceInfoMiddleware],
	personController.refresh
);

// Account activation
router.get(
	'/activate/:link',
	personController.activate
);

// Protected routes
router.get(
	'/me',
	[authMiddlewares],
	personController.getMe
);

router.get(
	'/persons',
	[authMiddlewares],
	personController.getPersons
);

module.exports = router;