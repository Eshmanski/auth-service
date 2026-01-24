const deviceInfoMiddleware = require('../middlewares/device');
const pageController = require('../controllers/page');
const Router = require('express');
const router = Router();

router.get('/login', [deviceInfoMiddleware], pageController.login);

module.exports = router;