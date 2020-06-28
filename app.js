"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// make handlebars the view engine
const hbs = require('express-handlebars');
app.engine('hbs', hbs({
    layoutsDir: path.join(__dirname, '/views/layouts'),
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

// static public directory
app.use(express.static(path.resolve('./public')));
// routes file
var routes = require('./routes');
app.use('/', routes);


// start server
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
