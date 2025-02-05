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
    body('nickname').isLength({ min: 3, max: 32 }),
    body('password').isLength({ min: 6, max: 32 })
];

const commonMiddleware = [
    deviceInfoMiddleware
];

const authMiddleware = [
    ...commonMiddleware,
    emailToLowerCase
];

// Registration and login
router.post(
    '/registration',
    [...authMiddleware, ...authValidation],
    personController.registration
);

router.post(
    '/login',
    authMiddleware,
    personController.login
);

// Session management
router.post(
    '/logout',
    commonMiddleware,
    personController.logout
);

router.get(
    '/refresh',
    commonMiddleware, 
    personController.refresh
);

// Account activation
router.get(
    '/activate/:link',
    commonMiddleware,
    personController.activate
);

// Protected routes
router.get(
    '/persons',
    [...commonMiddleware, authMiddlewares],
    personController.getPersons
);

module.exports = router;