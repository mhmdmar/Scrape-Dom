const express = require("express");
const app = express();
const router = require("./api/routes/router");

app.use(express.json(), router);

module.exports = app;
