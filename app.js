/**
 * Module dependencies.
 */
var express = require('express');
var session = require('express-session');
var compress = require('compression');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

/**
 * Controllers (route handlers).
 */

var homeCtrl = require('./controllers/index');
var usersCtrl = require('./controllers/users');
var secretCtrl = require('./controllers/secrets');

/**
 * Express configuration.
 */
//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  next();
};
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(allowCrossDomain);
app.use(compress());
app.use(connectAssets({
    paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(logger('dev'));
//app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secrets.sessionSecret,
    store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(lusca({
//    csrf: true,
//    xframe: 'SAMEORIGIN',
//    xssProtection: true
//}));
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeCtrl.getIndex);
app.get('/login', usersCtrl.getLogin);
app.post('/login', usersCtrl.postLogin);
app.get('/logout', usersCtrl.getLogout);
app.get('/signup', usersCtrl.getSignUp);
app.post('/signup', usersCtrl.postSingUp);
app.get('/secrets', secretCtrl.getSecret);
app.post('/secrets', secretCtrl.getSecret);

/* test */
app.post('/ng-signin', usersCtrl.postNgSignin);
app.post('/ng-signup', usersCtrl.postNgSignup);
app.get('/restricted', ensureAuthorized, usersCtrl.getRestricted);
app.get('/api/restricted', ensureAuthorized, usersCtrl.getApiRestricted);

function ensureAuthorized(req, res, next) {
  var bearerToken;
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.send(403);
  }
}
process.on('uncaughtException', function(err) {
  console.log(err);
});


/**
 * Error handler
 */
app.use(errorHandler());

/**
 * Start express server
 */
app.listen(app.get('port'), function() {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
