var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var passport     = require('passport');
var mongoose     = require('mongoose');
var isLoggedIn   = require('./routes/baseMiddlewares');

//Conectando na base
mongoose.connect('mongodb://localhost/avalweb');

//Routers
var questionsRouter     = require('./routes/questionsRouter');
var studentsRouter      = require('./routes/studentsRouter');
var testsRouter         = require('./routes/testsRouter');
var classesRouter       = require('./routes/classesRouter');
var studentTestRouter   = require('./routes/studentTestRouter');
var categoriesRouter    = require('./routes/categoriesRouter');
var invitesRouter       = require('./routes/invitesRouter');

//Main Router
var mainRouter = express.Router();

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ----- Passport Configuration // Session Configuration ----- //
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({usernameField: 'user',
    							passwordField: 'password'},
	
	function(username, password, done) {		
		if (password == "p" && username == "p"){
			var user = {username: username, type: 'professor'};
			return done(null, user);
		}
		else if (password == "a" && username == "a"){
			var user = {username: username, type: 'student'};
			return done(null, user);	
		}
		else{
			return done(null, false);
		}
	}
));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(userData, cb) {	
	cb(null, {user: userData});
});


app.use(session({secret: 'avalwebsecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

mainRouter.get('/start', isLoggedIn, function(req, res, next){
	console.log(req.session.passport);
	if(req.session.passport.user.type == 'professor'){
		res.sendFile(path.resolve('public/dashboard.html'));
	}
	else if(req.session.passport.user.type == 'student'){
		res.sendFile(path.resolve('public/studentDashboard.html'));
	}
	else{
		res.sendFile(path.resolve('public/index.html'));
	}
});

mainRouter.get('/errorLogin', function(req, res, next){	
	res.send("login error");	
});

mainRouter.get('/successLogin', function(req, res, next){	
	res.send("login ok");	
});

//Routers
app.use('/', mainRouter);
app.use('/questions', questionsRouter);
app.use('/students', studentsRouter);
app.use('/tests', testsRouter);
app.use('/classes', classesRouter);
app.use('/studenttests', studentTestRouter);
app.use('/categories', categoriesRouter);
app.use('/invites', invitesRouter);

app.post('/login',
	passport.authenticate('local',
		{ failureRedirect: '/errorLogin',
		  successRedirect: '/successLogin'}));

app.post('/logout', function(req, res){
	req.session.destroy();	
	res.send("logout ok");	
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
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
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
