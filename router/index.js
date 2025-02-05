const personController = require('../controllers/person');
const authMiddlewares = require('../middlewares/auth');
const { body } = require('express-validator');
const Router = require('express');
const router = Router();

router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 6, max: 32 }), personController.registration);
router.post('/logout', personController.logout);
router.post('/login', personController.login);

router.get('/persons', authMiddlewares, personController.getPersons);
router.get('/activate/:link', personController.activate);
router.get('/refresh', personController.refresh);

module.exports = router;