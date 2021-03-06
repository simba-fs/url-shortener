const config = require('config');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// connect to DB
const mongoose = require('mongoose');
mongoose.connect(config.get('DB'), {
	useNewUrlParser: true,
	useUnifiedTopology: true
	}, (err, db) => {
		if(err) return console.error(err);
		console.log('DB connect');
	});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// functions
const ip = (req) => (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '');

// favicon setup

// app.use(logger('dev', {
//	skip: function (req, res) { return res.statusCode <  }
// }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// locals
app.use((req, res, next) =>{
	res.locals = {
		...res.locals,
		ip: ip(req),
		appName: config.get('app.appName'),
		title: config.get('app.title'),
		subtitle: config.get('app.subtitle'),
		email: config.get('app.email'),
		hcaptcha: config.get('other.hcaptcha.sitekey'),
		GAid: config.get('other.GAid')
	}
	next();
});

// app.use((req, res, next) => {
//     console.log(req.body);
//     next();
// })
//
// app.use('/verify', require('./routes/verify.js'));
app.use('/admin', require('./routes/admin.js'));
app.use('/api', require('./routes/api.js'));
app.use('/error', require('./routes/error.js'));
app.use('/', require('./routes/index.js'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', err);
});

module.exports = app;
