const deviceInfoMiddleware = require('../middlewares/device');
const authMiddleware = require('../middlewares/auth.page');
const emailToLowerCase = require('../middlewares/email');
const pageController = require('../controllers/page');
const Router = require('express');
const router = Router();

// Authentication routes
const authValidation = [
	body('email').isEmail(),
	body('password').isLength({ min: 6, max: 32 })
];

router.get('/login', [deviceInfoMiddleware], pageController.loginPage);
router.get('/admin', [deviceInfoMiddleware, authMiddleware], pageController.adminPage);

router.post('/login', [deviceInfoMiddleware, emailToLowerCase, ...authValidation], pageController.login);
router.get('/logout', [deviceInfoMiddleware], pageController.logout);

module.exports = router;