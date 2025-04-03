const express = require('express');
const database = require('./config/database');
require('dotenv').config();

const routesApiVer1 = require("./api/v1/routes/index.route");

const app = express();
const port = process.env.PORT || 3000;

database.connect();

routesApiVer1(app)

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})