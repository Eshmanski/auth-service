const { getViewPath } = require('../utils');
const config = require('../config');
const personService = require('../service/person');
const tokenService = require('../service/token');


class PageController {
	async loginPage(req, res, next) {
		try {
			const accessToken = req.cookies.accessToken;
			if (accessToken) return res.redirect(config.pagePath + 'admin');

			const deviceType = req.device?.device_type || 'desktop';
			const viewPath = getViewPath('login', deviceType);

			res.render(viewPath, {
				basePath: config.basePath,
				apiPath: config.apiPath,
				pagePath: config.pagePath,
				deviceType: deviceType,
			});
		} catch (error) {
			next(error);
		}
	}

	async adminPage(req, res, next) {
		try {
			const deviceType = req.device?.device_type || 'desktop';
			const viewPath = getViewPath('admin', deviceType);

			const person = req.person;

			res.render(viewPath, {
				basePath: config.basePath,
				apiPath: config.apiPath,
				pagePath: config.pagePath,
				deviceType: deviceType,
				person: person,
			});
		} catch (error) {
			next(error);
		}
	}

	async login(req, res, next) {
		try {
			const body = req.body;

			const person = await personService.login(body);
			const accessToken = tokenService.generateAccessToken(person);

			res.cookie('accessToken', accessToken, { maxAge: 1000 * 60 * 60, httpOnly: true });

			res.redirect(config.pagePath + 'admin');
		} catch (error) {
			next(error);
		}
	}

	async logout(req, res, next) {
		try {
			res.clearCookie('accessToken');

			res.redirect(config.pagePath + 'login');
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new PageController();