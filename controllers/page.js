class PageController {
    async login(req, res, next) {
        res.render('login');
    }
}

module.exports = new PageController();