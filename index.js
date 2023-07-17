const express = require('express');
const {connection} = require('./db.js');
const {userRouter} = require('./routes/user.routes.js');
const {cityRouter} = require('./routes/city.routes.js');
const winston = require('winston');
const expresswinston = require('express-winston');
const {redis} = require('./redis.js');

require('dotenv').config();

const app = express();

app.use(
    expresswinston.logger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true,
                level: 'info',
            }),
        ],
        format: winston.format.prettyPrint(),
    })
);

app.use(express.json());
app.use('/users', userRouter);
app.use('/getCity', cityRouter);

app.listen(process.env.port, async function () {
    console.log('Server is in Process...');
    await connection;
    console.log(`server URL : http://localhost:${process.env.port}`);
});
