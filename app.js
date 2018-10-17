// npm packages
const express = require('express');
const app = express();
const genericRoute = require('./api/routes/generic');
const dynamicRoute = require('./api/routes/dynamic');

// Product API
app.use('/scrape', express.json(), genericRoute);
app.use('/dynamic', express.json(), dynamicRoute);

module.exports = app;