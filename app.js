const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const config = require('./config.js');
const { Client } = require('pg');
console.log('config db', config.db);
const client = new Client(config.db);

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

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.get('/brand/create', function(req,res){
	res.render('create-brand', {
	});
});

app.get('/brands', (req,res)=>{
	res.render('brands', {
	});
});

app.post('/brands', function(req,res){
	console.log(req.body)
	// addBrand(data);
	res.render('brands', req.body); // getListBrand());
});

// function addBrand(data) {
	// INSERT query function or array??
	// this.list.push(data);
// }

// function getListBrand() {
	// SELECT query and format to JSON
	// return JSON format of List of all brands currently on the list
	// return JSON.stringify(this.list);
// }

app.get('/category/create', (req,res)=>{
	res.render('create-category',{
	});
});

app.post('/categories', (req,res)=>{
	console.log(req.body)
	res.render('categories', req.body);
});

app.get('/product/create',(req,res)=>{
	res.render('create-product',{

	});
});

app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT * FROM Products;', (req, data)=>{
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


app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product ID: ${req.body.productid}</li>
			<li>Quantity ${req.body.quantity}</li>
		</ul>
	`;

	//nodemailer
	let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'team20module1@gmail.com', 
            pass: 'team20-module1' 
        }
    });

    let mailOptions = {
        from: '"Adidas Mailer" <team20module1@gmail.com>',
        to: 'carlo10punzalan@gmail.com, kimlesliefaina.klf@gmail.com',
        subject: 'Adidas Shoes Contact Request',
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        client.query('SELECT * FROM Products', (req, data)=>{
			var list = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					list.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: list,
				msg: '---Email has been sent---'
			});
		});
     });
});


//Server
app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');
});
