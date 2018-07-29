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

app.get('/member/20/carlo',function(req,res) {
	res.render('member', {
		name: "Carlo",
		full_name: "Carlo S. Punzalan",
		email: "carlo10punzalan@gmail.com",
		phone: '09976897678',
		imageUrl: 'https://thumbs.dreamstime.com/b/boy-cartoon-backpacks-illustration-45759680.jpg',
		hobbies: ['Playing games', 'Sleeping']
	})
});

app.get('/member/20/kim',function(req,res) {
	res.render('member', {
		name: "Kim",
		full_name: "Kim Leslie B. Faina",
		email: "kimlesliefaina.klf@gmail.com",
		phone: '09169783384',
		imageUrl: 'https://easydrawingguides-7512.kxcdn.com/wp-content/uploads/2017/02/How-to-draw-a-cartoon-girl-20.png',
		hobbies: ['Reading', 'Watching KPOP']
	})
});


//Server
app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');
});