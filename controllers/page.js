class PageController {
    async login(req, res, next) {
        res.render('login', {
            basePath: process.env.BASE_PATH || '/'
        });
    }
}

module.exports = new PageController();