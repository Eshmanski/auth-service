const { getViewPath } = require('../utils');

class PageController {
    async login(req, res, next) {
        const deviceType = req.device?.device_type || 'desktop';
        const viewPath = getViewPath('login', deviceType);

        res.render(viewPath, {
            basePath: process.env.BASE_PATH || '/',
            deviceType: deviceType,
        });
    }
}

module.exports = new PageController();