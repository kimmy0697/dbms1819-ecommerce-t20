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
			database: 'dd8kc2u4cu7i9d',
			user: 'ffvgqavajynjjs',
			password: 'fcd02fa73b5ebb0764264b3f00ddf5e09d6240e9ea64c7b3d5852eb8c74b1a45',
			host: 'ec2-23-21-216-174.compute-1.amazonaws.com',
			port: 5432,
			ssl: true
		},
		nodemailer: {
			
		}
	}
};

module.exports = process.env.NODE_ENV == "production" ? config.production : config.development;