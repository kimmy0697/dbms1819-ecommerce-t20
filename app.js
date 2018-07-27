const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { Client } = require('pg');
const client = new Client({
	 database: 'MyDatabase',
	 user: 'postgres',
	 password: 'kimkim669977',
	 host: 'localhost',
	 port: 5432

	// database: 'ec2-54-204-23-228.compute-1.amazonaws.com',
	// user: 'nyhwiqhxjnmsqx',
	// password: '74e9e4de45586285106edf7ce7c0f8d155d3c2f42c7e6876185bb0e34aaae7c4',
	// host: 'ec2-54-204-23-228.compute-1.amazonaws.com',
	// port: 5432,
	// ssl: true
});

client.connect()
	.then(function(){
		console.log('Connected to database')
	})
	.catch(function(err){
		console.log('Cannot connect to database')
	});

const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');
app.set('port',(process.env.PORT|| 3000));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static1')));


app.get('/', function(req, res) {
	res.render('home',{

	});
});

// connect to database
app.get('/products',(req,res)=>{
	return client.query('SELECT * FROM Products;')

	.then((results)=>{
		console.log('results[2]', results);
		res.render('products', results);

	})
	.catch((err)=>{
		console.log('error', err);
		res.send('Error!');
	});
});

//Server
app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');
});