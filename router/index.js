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
    [deviceInfoMiddleware, emailToLowerCase],
    personController.login
);

// Session management
router.post(
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
    [deviceInfoMiddleware],
    personController.activate
);

// Protected routes
router.get(
    '/persons',
    [deviceInfoMiddleware, authMiddlewares],
    personController.getPersons
);

module.exports = router;