const serverless = require('serverless-http');
const express = require('express');
const app = express();

const api_v1 = require('./api_v1');

// Set JSON space length to pretty print response on browser.
// See more of this workaround here: https://stackoverflow.com/a/48062695/4084391
app.set('json spaces', 2);

app.use('/api/v1', api_v1);

module.exports.handler = serverless(app);