const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { Client } = require('pg');
const client = new Client({
	 // database: 'MyDatabase',
	 // user: 'postgres',
	 // password: 'kimkim669977',
	 // host: 'localhost',
	 // port: 5432

	database: 'dd8kc2u4cu7i9d',
	user: 'ffvgqavajynjjs',
	password: 'fcd02fa73b5ebb0764264b3f00ddf5e09d6240e9ea64c7b3d5852eb8c74b1a45',
	host: 'ec2-23-21-216-174.compute-1.amazonaws.com',
	port: 5432,
	ssl: true
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
	
	client.query('SELECT * FROM Products;', (req,data)=>{

		var list = [];

		for (var i=0; i< data.rows.length; i++){
			list.push(data.rows[i]);
		}
		res.render('products',{
			data: list,
			title: 'Most Popular Shoes'
		});
	});
});

app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT * FROM Products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length+1; i++) {
			if (i==id) {
				list.push(data.rows[i-1]);
			}
		}
		res.render('product-details',{
			data: list
		});
	});
});

	// .then((results)=>{
	// 	console.log('results[2]', results);
	// 	res.render('products', results);

	// })
	// .catch((err)=>{
	// 	console.log('error', err);
	// 	res.send('Error!');
	// });
// });

//Server
app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');
});