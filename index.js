require('dotenv').config();

const errorMiddlewares = require('./middlewares/error');
const useragent = require('express-useragent');
const cookieParser = require('cookie-parser');
const router = require('./router');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT ?? 5000;
const CORS_OPTIONS = {
    credentials: true,
    origin: process.env.CLIENT_URL,
}

const app = express();

app.use(cors(CORS_OPTIONS));
app.use(useragent.express());
app.use(express.json());
app.use(cookieParser());
app.use('/api', router);
app.use(errorMiddlewares);

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

start();