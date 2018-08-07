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
// 	 client.query('SELECT * FROM products;')
// 	.then((results)=>{
// 	    console.log('results?', results);
// 		res.render('products', results);
// 	})
// 	.catch((err) => {
// 		console.log('error',err);
// 		res.send('Error!');
// 	});
// });


// Creating products, brands and categories

app.get('/brand/create', function(req,res){
	res.render('create-brand', {
	});
});

app.get('/category/create', (req,res)=>{
	res.render('create-category',{
	});
});

app.get('/product/create', function(req, res) {
	 var category = []; 
	 var brand = [];
	 var both =[];
	 client.query('SELECT * FROM brands')
	.then((result)=>{
	    brand = result.rows;
	    console.log('brand:',brand);
	    both.push(brand);
	})
	.catch((err) => {       
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category')
	.then((result)=>{
	    category = result.rows;
	    both.push(category);
	    console.log(category);
	    console.log(both);
		res.render('create-product',{
			rows: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

});

// Post method requests 

app.post('/brands', function(req,res){
	console.log(req.body)
	client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('" + req.body.brand_name + "','" + req.body.brand_description + "')");
	res.redirect('/brands');
});

app.post('/categories', function(req, res) {
	client.query("INSERT INTO products_category (product_category_name) VALUES ('" + req.body.product_category_name + "')");
	
	res.redirect('/categories');
});

app.post('/insert_products', function(req, res) {	
	client.query("INSERT INTO products (name,description,tagline,price,warranty,brand_id,category_id,image) VALUES ('" + req.body.name + "', '" + req.body.description + "', '" + req.body.tagline + "', '" + req.body.price + "', '" + req.body.warranty + "', '" + req.body.brand_id + "', '" + req.body.category_id + "','" + req.body.image + "')")
	.then((results)=>{
	    // console.log('results?', results);
		res.redirect('/products');
		// res.render('products', results);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});	
});

app.post('/updateproduct/:id', function(req, res) {
	client.query("UPDATE products SET name = '" +req.body.productsname+"', descriptions = '"+req.body.productsdesc+"', tagline = '"+req.body.productstag+"', price = '"+req.body.productsprice+"', warranty = '"+req.body.productswarranty+"',category_id = '"+req.body.category+"', brand_id = '"+req.body.brand+"', img = '"+req.body.productsimg+"'WHERE id = '"+req.params.id+"' ;");
	client.query("UPDATE brands SET description = '"+req.body.brand_description+"' WHERE id ='"+req.params.id+"';");
	
	res.redirect('/products');
});

// Displaying list of data in client side

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

app.get('/brands', function(req, res) {
		 client.query('SELECT * FROM brands')
	.then((result)=>{
	    console.log('results?', result);
		res.render('brands', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});

app.get('/categories', function(req, res) {
		 client.query('SELECT * FROM products_category')
	.then((result)=>{
	    console.log('results?', result);
		res.render('categories', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});

app.get('/product/update/:id', function(req, res) {
  	var category = []; 
	 	var brand = [];
	 	var both =[];
	  client.query('SELECT * FROM brands;')
	.then((result)=>{
		brand = result.rows;
	    console.log('brand:',brand);
	    both.push(brand);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category;')
	.then((result)=>{
		category = result.rows;
	  
	    both.push(category);
	      console.log('both',both);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
	 client.query('SELECT products.id AS products_id, products.image AS products_image, products.name AS products_name, products.description AS products_description, products.tagline AS products_tagline, products.price AS products_price, products.warranty AS products_warranty, brands.brand_name AS brand_name, brands.brand_description AS brand_description, products_category.product_category_name AS category_name FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+'; ')
	.then((result)=>{
		res.render('update-product', {
			rows: result.rows[0],
			brand: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
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

// app.get('/products/:id', function(req, res) {
// 	 client.query('SELECT products.id AS products_id, products.image AS products_image, products.name AS products_name, products.description AS products_description, products.tagline AS products_tagline, products.price AS products_price, products.warranty AS products_warranty, brands.brand_name AS brand_name, brands.brand_description AS brand_description, products_category.product_category_name AS category_name FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+'; ')
// 	.then((results)=>{
// 		console.log ('results?',results);
// 		res.render('product-details',{
// 		name: results.rows[0].products_name,
// 		description: results.rows[0].products_description,
//     	tagline: results.rows[0].products_tagline,
// 		price: results.rows[0].products_price,
// 		warranty: results.rows[0].products_warranty,
// 		image: results.rows[0].products_image,
// 		brandname: results.rows[0].brand_name,
// 		branddesc: results.rows[0].brand_description,
// 		category: results.rows[0].category_name,
// 		id: results.rows[0].products_id
// 	})
// 	})
// 	.catch((err) => {
// 		console.log('error',err);
// 		res.send('Error!');
// 	});
// });


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
