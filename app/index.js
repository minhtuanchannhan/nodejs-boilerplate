const express = require('express');
const path = require('path');
const logger = require('morgan');
const lusca = require('lusca');
const flash = require('express-flash');
const session = require('express-session');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const passport = require('passport');
const expressStatusMonitor = require('express-status-monitor');
const compression = require('compression');
// const multer = require('multer');
const chalk = require('chalk');
const models = require('./models');
const config = require('../config');
const routes = require('../routes');
// const upload = multer({ dest: path.join(__dirname, '../public/uploads') });
const app = express();

models.sequelize
	.authenticate()
	.then(() => {
		console.log(
			'%s Connection has been established successfully.',
			chalk.green('✓')
		);
	})
	.catch((err) => {
		console.error(err);
		console.log('%s Unable to connect to SQL database.', chalk.red('✗'));
		process.exit();
	});

app.set('port', config.app_port);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

if (config.app_env === 'production') {
	app.set('trust proxy', true);
}

app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	session({
		name: config.app_name,
		resave: true,
		saveUninitialized: true,
		secret: config.app_secret,
		cookie: {
			maxAge: 1209600000,
			secure: config.app_env === 'production',
			httpOnly: config.app_env === 'production',
		},
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
	if (req.path === '/api/upload') {
		next();
	} else {
		lusca.csrf()(req, res, next);
	}
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.disable('etag');
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use((req, res, next) => {
	if (
		!req.user &&
		req.path !== '/login' &&
		req.path !== '/signup' &&
		!req.path.match(/^\/auth/) &&
		!req.path.match(/\./)
	) {
		req.session.returnTo = req.originalUrl;
	} else if (
		req.user &&
		(req.path === '/account' || req.path.match(/^\/api/))
	) {
		req.session.returnTo = req.originalUrl;
	}
	next();
});
app.use(
	express.static(path.join(__dirname, '../public'), { maxAge: 31557600000 })
);
app.use('/', routes);

if (config.app_env === 'development') {
	app.use(errorHandler());
} else {
	app.use((err, req, res, next) => {
		console.error(err);
		res.status(500).send('Server Error');
	});
}

app.listen(config.app_port, () => {
	console.log(
		'%s App is running at http://localhost:%d in %s mode.',
		chalk.green('✓'),
		config.app_port,
		config.app_env
	);
	console.log('  Press CTRL-C to stop.\n');
});

module.exports = app;
