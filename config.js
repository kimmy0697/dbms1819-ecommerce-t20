const config = {
	development: {
		db: {
			 database: 'MyDatabase',
			 user: 'postgres',
			 password: 'Kimmylo1006',
			 host: 'localhost',
			 port: 5432
		},
		nodemailer: {

		}
	},
	production: {
		db: {
			database: process.env.DB_DATABASE,
			user: process.env.DB_USER,
			password: process.env.DB_PW,
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			ssl: true
		},
		nodemailer: {
			
		}
	}
};

module.exports = process.env.NODE_ENV == "production" ? config.production : config.development;