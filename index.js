require('dotenv').config();

const errorPAGEMiddlewares = require('./middlewares/error.page');
const errorApiMiddlewares = require('./middlewares/error.api');
const routerPAGE = require('./router/router.page');
const redisClient = require('./plugins/DB/Redis');
const routerAPI = require('./router/router.api');
const useragent = require('express-useragent');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT ?? 5000;
const CORS_OPTIONS = {
	credentials: true,
	origin: process.env.CLIENT_URL,
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors(CORS_OPTIONS));
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/page', routerPAGE);
app.use(errorPAGEMiddlewares);

app.use('/api', routerAPI);
app.use(errorApiMiddlewares);

const start = async () => {
	try {
		await redisClient.connect();

		app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
	} catch (error) {
		console.log(error);
	}
}

start();