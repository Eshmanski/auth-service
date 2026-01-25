const deviceInfoMiddleware = require('../middlewares/device');
const authMiddleware = require('../middlewares/auth.page');
const pageController = require('../controllers/page');
const Router = require('express');
const router = Router();

router.get('/login', [deviceInfoMiddleware], pageController.loginPage);
router.get('/admin', [deviceInfoMiddleware, authMiddleware], pageController.adminPage);

router.post('/login', [deviceInfoMiddleware], pageController.login);
router.get('/logout', [deviceInfoMiddleware], pageController.logout);

module.exports = router;