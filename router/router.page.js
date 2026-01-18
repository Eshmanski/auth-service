const Router = require('express');
const pageController = require('../controllers/page');
const router = Router();

router.get('/login', pageController.login);

module.exports = router;