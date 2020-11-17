require('dotenv').config();

module.exports = {
	app_name: process.env.APP_NAME || 'nodejs_boilerplate',
	app_env: process.env.APP_ENV || 'development',
	app_port: process.env.APP_PORT || '3000',
	db_dialect: process.env.DB_DIALECT || 'mysql',
	db_host: process.env.DB_HOST || 'localhost',
	db_name: process.env.DB_NAME || 'db_name',
	db_user: process.env.DB_USER || 'db_user',
	db_password: process.env.DB_PASSWORD || '',
	app_secret: process.env.SESSION_SECRET || 'secret',
	salt: process.env.SALT || 'secret',
};
