var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session'); 
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');

var sqlRouter = require('./routes/sql');
const { v4: uuidv4 } = require('uuid');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'public' directory
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

app.use(session({
  secret: uuidv4(), // Change this to a random string
  resave: false,
  saveUninitialized: true
}));






// Route for handling form submission

app.use('/', indexRouter);

app.use('/sql', sqlRouter);



module.exports = app;
