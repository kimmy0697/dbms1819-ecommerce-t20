/******************Constant Variables*******************************/

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const config = require('./config.js');
const { Client } = require('pg');
// console.log('config db', config.db);
// const client = new Client(config.db);
const Product = require('./models/product');
const Brand = require('./models/brand');
const Customer = require('./models/customer');
const Order = require('./models/order');
const Category = require('./models/category');
const Handlebars = require('handlebars');
const MomentHandler = require('handlebars.moment');
MomentHandler.registerHelpers(Handlebars);
const NumeralHelper = require("handlebars.numeral");
NumeralHelper.registerHelpers(Handlebars);
// const PORT = process.env.PORT || 3000


const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');

/******************Connection to Database***************************/

const client = new Client({
  database: 'dd8kc2u4cu7i9d',
  user: 'ffvgqavajynjjs',
  password: 'fcd02fa73b5ebb0764264b3f00ddf5e09d6240e9ea64c7b3d5852eb8c74b1a45',
  host: 'ec2-23-21-216-174.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});

client.connect()
  .then(function () {
    console.log('Connected to database');
  })
  .catch(function (err) {
    if (err) {
      console.log('Cannot connect to database');
    };
  });

/******************Folder Directories***************************/

const app = express();

// tell express which folder is a static/public folder
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static1')));

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize()); 
app.use(passport.session());

//Authentication and Session--------------------------------------------
passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function(email, password, cb) {
    Customer.getByEmail(client,email, function(user) {
      if (!user) { return cb(null, false); }
    
      return cb(null, user);
    });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  Customer.getById(client,id, function (user) {
    cb(null, user);
  });
});

function isAdmin(req, res, next) {
   if (req.isAuthenticated()) {
  Customer.getCustomerData(client,{id: req.user.id}, function(user){
    role = user[0].user_type;
    console.log('role:',role);
    if (role == 'admin') {
        return next();
    }
    else{
      res.send('cannot access!');
    }
  });
  }
  else{
res.redirect('/login');
}
}
function isCustomer(req, res, next) {
   if (req.isAuthenticated()) {
  Customer.getCustomerData(client,{id: req.user.id}, function(user){
    role = user[0].user_type;
    console.log('role:',role);
    if (role == 'customer') {
        return next();
    }
    else{
      res.send('cannot access!');
    }
  });
  }
  else{
res.redirect('/login');
}
}


/*********************Home***************************/

app.get('/', function (req, res) {
  res.render('client/home', {
  });
});

app.get('/login', function (req, res) {
  res.render('client/login', {
  });
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
  Customer.getById(client, req.user.id, function(user){
    role = user.user_type;
    req.session.user = user;
      console.log(req.session.user);
    console.log('role:',role);
    if (role == 'customer'){
        res.redirect('/')
    }
    else if (role == 'admin'){
        res.redirect('/admin')
    }
     });
  });

app.get('/signup', function (req, res){
  res.render('client/signup', {
  });
});

app.post('/signup', (req,res) => {
  client,query("INSERT INTO customers(first_name, middle_name, last_name, state, city, street, zipcode, password, user_type) VALUES ('" + req.body.fname + "','" + req.body.mname + "','" + req.body.lname + "','" + req.body.state + "','" + req.body.city + "','" + req.body.street + "','" + req.body.zipcode + "','" + req.body.password + "','" + req.body.user_type + "');");
  res.redirect('/login');
});

/*********************Client Products***************************/

// Products List Page
app.get('/products', function (req, res) {
  Product.list(client, {}, function(products) {
    res.render('client/products', {
      title: 'Most Popular Shoes',
      products: products
    });
  });
});

// Product Details Page
app.get('/products/:id', function (req, res) {
  Product.getById(client, req.params.id, function (productData) {
    res.render('client/product-details', productData);
  });
});

// Create Product Page
app.get('/admin/product/create', function (req, res) {
  var category = [];
  var brand = [];
  var both = [];
  client.query('SELECT * FROM brands')
    .then((result) => {
      brand = result.rows;
      console.log('brand:', brand);
      both.push(brand);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT * FROM products_category')
    .then((result) => {
      category = result.rows;
      both.push(category);
      console.log(category);
      console.log(both);
      res.render('admin/create-product', {
        rows: both,
        layout: 'admin-layout'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});


// Order Product Using Nodemailer
app.post('/products/:id/send', function (req, res) {
  client.query("INSERT INTO customers (email, first_name, middle_name, last_name, state, city, street, zipcode) VALUES ('" + req.body.email + "', '" + req.body.first_name + "', '" + req.body.middle_name + "', '" + req.body.last_name + "', '" + req.body.state + "', '" + req.body.city + "', '" + req.body.street + "', '" + req.body.zipcode + "') ON CONFLICT (email) DO UPDATE SET first_name = ('" + req.body.first_name + "'), middle_name = ('" + req.body.middle_name + "'), last_name = ('" + req.body.last_name + "'), state = ('" + req.body.state + "'), city = ('" + req.body.city + "'), street = ('" + req.body.street + "'), zipcode = ('" + req.body.zipcode + "') WHERE customers.email ='" + req.body.email + "';");
  client.query("SELECT id FROM customers WHERE email = '" + req.body.email + "';")
    .then((results) => {
      var id = results.rows[0].id;
      console.log(id);
      client.query("INSERT INTO orders (product_id,customer_id,quantity) VALUES ('" + req.body.products_id + "', '" + id + "', '" + req.body.quantity + "')")

        .then((results) => {
          var maillist = ['team20module1@gmail.com', req.body.email];
          var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: 'team20module1@gmail.com',
              pass: 'kimmylo1006'
            }
          });
          const mailOptions = {
            from: '"Team 20" <team20module1@gmail.com>',
            to: maillist,
            subject: 'Order Request Information',
            html:

    '<table>' +
    '<thead>' +
    '<tr>' +
    '<th>Customer</th>' +
    '<th>Name</th>' +
    '<th>Email</th>' +
    '<th>Product</th>' +
    '<th>Quantity</th>' +
    '</tr>' +
    '<thead>' +
    '<tbody>' +
    '<tr>' +
    '<td>' + req.body.first_name + '</th>' +
    '<td>' + req.body.last_name + '</td>' +
    '<td>' + req.body.email + '<td>' +
    '<td>' + req.body.products_name + '</td>' +
    '<td>' + req.body.quantity + '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>'
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            res.redirect('/products');
          });
        })
        .catch((err) => {
          console.log('error', err);
          res.send('Error!');
        });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});


/*********************Admin Products***************************/

app.get('/admin/dashboard', function(req, res) {
  var thisDay;
  var oneDayAgo;
  var twoDaysAgo;
  var threeDaysAgo;
  var fourDaysAgo;
  var fiveDaysAgo;
  var sixDaysAgo;
  var sevenDaysAgo;
  var totalSalesLast7days;
  var totalSalesLast30days;
  var mostOrderedProduct;
  var leastOrderedProduct;
  var mostOrderedBrand;
  var mostOrderedCategory;
  // var topCustomersMostOrder;
  Order.thisDay(client, {},function(result){
    thisDay = result
  });
  Order.oneDayAgo(client, {},function(result){
    oneDayAgo = result
  });
  Order.twoDaysAgo(client, {},function(result){
    twoDaysAgo = result
  });
  Order.threeDaysAgo(client, {},function(result){
    threeDaysAgo = result
  });
  Order.fourDaysAgo(client, {},function(result){
    fourDaysAgo = result
  });
  Order.fiveDaysAgo(client, {},function(result){
    fiveDaysAgo = result
  });
  Order.sixDaysAgo(client, {},function(result){
    sixDaysAgo = result
  });
  Order.sevenDaysAgo(client, {},function(result){
    sevenDaysAgo = result
  });
  Order.totalSalesLast7days(client, {},function(result){
    totalSalesLast7days = result
  });
  Order.totalSalesLast30days(client, {},function(result){
    totalSalesLast30days = result
  });
  Product.mostOrderedProduct(client, {},function(result){
    mostOrderedProduct = result
  });
  Product.leastOrderedProduct(client, {},function(result){
    leastOrderedProduct = result
  });
  Brand.mostOrderedBrand(client, {},function(result){
    mostOrderedBrand = result
  });
  Category.mostOrderedCategory(client, {},function(result){
    mostOrderedCategory = result
  });
  Customer.topCustomersMostOrder(client, {},function(result){
    topCustomersMostOrder = result
  });
  Customer.topCustomersHighestPayment(client,{},function(result){
      res.render('admin/dashboard', {
      layout: 'admin-layout',
      topCustomersHighestPayment : result,
      thisDay: thisDay[0].count,
      oneDayAgo: oneDayAgo[0].count,
      twoDaysAgo: twoDaysAgo[0].count,
      threeDaysAgo: threeDaysAgo[0].count,
      fourDaysAgo: fourDaysAgo[0].count,
      fiveDaysAgo: fiveDaysAgo[0].count,
      sixDaysAgo: sixDaysAgo[0].count,
      sevenDaysAgo: sevenDaysAgo[0].count,
      totalSalesLast7days: totalSalesLast7days[0].sum,
      totalSalesLast30days: totalSalesLast30days[0].sum,
      mostOrderedProduct: mostOrderedProduct,
      leastOrderedProduct: leastOrderedProduct,
      mostOrderedBrand: mostOrderedBrand,
      mostOrderedCategory: mostOrderedCategory,
      topCustomersMostOrder : topCustomersMostOrder
    });
  });
});

app.get('/admin', isAdmin, function (req, res) {
  res.render('admin/home', {
    layout: 'admin-layout'
  });
});

app.get('/admin/developers', function (req, res) {
  res.render('admin/developers', {
    layout: 'admin-layout'
  });
});

app.get('/admin/products', function (req, res) {
  client.query(`SELECT 
      products.id AS products_id,
      products.image AS products_image,
      products.name AS products_name,
      products.description AS products_description,
      products.tagline AS products_tagline,
      products.price AS products_price,
      products.warranty AS products_warranty,
      brands.brand_name AS brand_name,
      brands.brand_description AS brand_description,
      products_category.product_category_name AS category_name
    FROM products 
    INNER JOIN brands ON products.brand_id=brands.id
    INNER JOIN products_category ON products.category_id=products_category.id`)
    .then((results) => {
      console.log('results?', results);
      res.render('admin/admin-products', {
        rows: results.rows,
        layout: 'admin-layout'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});
//   Product.list(client, {}, function(products) {
//     res.render('admin/admin-products', {
//       layout: 'admin-layout',
//       products: products
//     });
//   });
// });

// Product Details Page
app.get('/admin/products/:id', function (req, res) {
  client.query(`SELECT
      products.id AS products_id,
      products.image AS products_image,
      products.name AS products_name,
      products.description AS products_description,
      products.tagline AS products_tagline,
      products.price AS products_price,
      products.warranty AS products_warranty,
      brands.brand_name AS brand_name,
      brands.brand_description AS brand_description,
      products_category.product_category_name AS category_name
    FROM products
    INNER JOIN brands ON products.brand_id=brands.id
    INNER JOIN products_category ON products.category_id=products_category.id
    WHERE products.id = ` + req.params.id + `; `)
    .then((results) => {
      console.log('results?', results);
      res.render('admin/admin-product-details', {
        layout: 'admin-layout',
        name: results.rows[0].products_name,
        description: results.rows[0].products_description,
        tagline: results.rows[0].products_tagline,
        price: results.rows[0].products_price,
        warranty: results.rows[0].products_warranty,
        image: results.rows[0].products_image,
        brandname: results.rows[0].brand_name,
        branddescription: results.rows[0].brand_description,
        category: results.rows[0].category_name,
        id: results.rows[0].products_id
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});
//   Product.getById(client, req.params.id, function (productData) {
//     res.render('client/products', productData);
//   });
// });


// Update Product Form Page
app.get('/admin/product/update/:id', function (req, res) {
  var category = [];
  var brand = [];
  var both = [];
  client.query('SELECT * FROM brands;')
    .then((result) => {
      brand = result.rows;
      console.log('brand:', brand);
      both.push(brand);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT * FROM products_category;')
    .then((result) => {
      category = result.rows;

      both.push(category);
      console.log('both', both);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query(`SELECT
      products.id AS products_id,
      products.image AS products_image,
      products.name AS products_name,
      products.description AS products_description,
      products.tagline AS products_tagline,
      products.price AS products_price,
      products.warranty AS products_warranty,
      brands.brand_name AS brand_name,
      brands.brand_description AS brand_description,
      products_category.product_category_name AS category_name
    FROM products
    INNER JOIN brands
    ON products.brand_id=brands.id
    INNER JOIN products_category
    ON products.category_id=products_category.id
    WHERE products.id = ` + req.params.id + `; `)
    .then((result) => {
      res.render('admin/update-products', {
        rows: result.rows[0],
        brand: both,
        layout: 'admin-layout'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.post('/updateproduct/:id', function (req, res) {
  client.query("UPDATE products SET name = '" + req.body.products_name + "', description = '" + req.body.products_description + "', tagline = '" + req.body.products_tagline + "', price = '" + req.body.products_price + "', warranty = '" + req.body.products_warranty + "',brand_id = '" + req.body.brand_name + "', category_id = '" + req.body.category_name + "', image = '" + req.body.products_image + "'WHERE id = '" + req.params.id + "' ;");
  client.query("UPDATE brands SET brand_description = '" + req.body.brand_description + "' WHERE id ='" + req.params.id + "';");

  res.redirect('admin/products');
});

// Create Product Form Page
app.post('/insert_products', function (req, res) {
  client.query("INSERT INTO products (name,description,tagline,price,warranty,brand_id,category_id,image) VALUES ('" + req.body.name + "', '" + req.body.description + "', '" + req.body.tagline + "', '" + req.body.price + "', '" + req.body.warranty + "', '" + req.body.brand_id + "', '" + req.body.category_id + "','" + req.body.image + "')")
    .then((results) => {
      console.log('results?', results);
      res.redirect('admin/products');
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});


/*********************Brands***************************/


// Create Brand Page
app.get('/admin/brand/create', function (req, res) {
  res.render('admin/create-brand', {
    layout: 'admin-layout'
  });
});

// Create Brand Form
app.post('/brands', function (req, res) {
  console.log(req.body);
  client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('" + req.body.brand_name + "','" + req.body.brand_description + "')")
  .then((results)=>{
    res.render('admin/create-brand', {
      layout: 'admin-layout'
    })
  })
  .catch((err) => {
    res.redirect('/admin/brand/create-error');
  });
});

// Error Create Brand Page
app.get('/admin/brand/create-error', function (req, res) {
  res.render('admin/errors/create-brand-error', {
    layout: 'error-layout'
  });
});

// Brands List Page
app.get('/admin/brands', function (req, res) {
  Brand.list(client, {}, function (brands) {
    res.render('admin/brands', {
      layout: 'admin-layout',
      brands: brands
    });
  });
});

/*********************Categories***************************/

// Create Category Page
app.get('/admin/category/create', function (req, res) {
  res.render('admin/create-category', {
    layout: 'admin-layout'
  });
});

// Create Category Form
app.post('/categories', function (req, res) {
  client.query("INSERT INTO products_category (product_category_name) VALUES ('" + req.body.product_category_name + "')")
  .then((results)=>{
    res.render('admin/create-category', {
      layout: 'admin-layout'
    });
  })
  .catch((err) => {
    res.redirect('/admin/category/create-error');
  });
});

// Error Create Category Page
app.get('/admin/category/create-error', (req, res) => {
  res.render('admin/errors/create-category-error', {
    layout: 'error-layout'
  });
});


// Categories List Page
app.get('/admin/categories', function (req, res) {
  Category.list(client, {}, function (products_category) {
    res.render('admin/categories', {
      layout: 'admin-layout',
      products_category: products_category
    });
  });
});


/*********************Orders***************************/

// Orders List Page
app.get('/admin/orders', function (req, res) {
  Order.list(client, {}, function (orders) {
    res.render('admin/orders', {
      layout: 'admin-layout',
      orders: orders
    });
  });
});


/*********************Customers***************************/


// Customers List Page
app.get('/admin/customers', function (req, res) {
  Customer.list(client, {}, function (customers) {
    res.render('admin/customers', {
      layout: 'admin-layout',
      customers: customers
    });
  });
});

// Customer Details Page
app.get('/admin/customers/:id', function (req, res) {
  client.query("SELECT customers.first_name AS first_name, customers.middle_name AS middle_name, customers.last_name AS last_name, customers.email AS email, customers.state AS state, customers.city AS city, customers.street AS street, customers.zipcode AS zipcode, products.name AS product_name, orders.quantity AS quantity, orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON orders.customer_id=customers.id INNER JOIN products ON orders.product_id=products.id WHERE customers.id = '" + req.params.id + "' ORDER BY purchase_date DESC;")
    .then((result) => {
      console.log('results?', result);
      res.render('admin/customer-details', {
        rows: result.rows,
        layout: 'admin-layout'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});
//   Customer.getByCustomerId(client, req.params.id, function (customerData) {
//     res.render('admin/customer-details', {
//       customerData,
//       layout: 'admin-layout'
//     });
//   });
// });


/*********************Server***************************/

app.listen(app.get('port'), function () {
  console.log('Server started at port 3000');
});

// app.listen(3000, function () {
//   console.log('Server started at port 3000');
// });