var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var dbConfig = require('./db');
var mongoose = require('mongoose');
// Connect to DB
mongoose.connect(dbConfig.url);

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
//hbs.registerPartial('footer', fs.readFileSync(__dirname + '/views/partial.hbs', 'utf8'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

app.use(expressSession({secret: 'bingotheword', resave: false, saveUninitialized: false, store: new MongoStore({ mongooseConnection: mongoose.connection })}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.title = 'Bingo 📍';
    res.locals.user =  req.user;
    next();
});

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;