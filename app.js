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
  .then(function () {
    console.log('Connected to database');
  })
  .catch(function (err) {
    if (err) {
      console.log('Cannot connect to database');
    };
  });

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

app.get('/', function (req, res) {
  res.render('home', {
  });
});

// Creating products, brands and categories

app.get('/admin', function (req, res) {
  res.render('admin', {
  });
});

app.get('/developers', function (req, res) {
  res.render('developers', {
  });
});

app.get('/brand/create', function (req, res) {
  res.render('create-brand', {
  });
});

app.get('/category/create', (req, res) => {
  res.render('create-category', {
  });
});

app.get('/product/create', function (req, res) {
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
      res.render('create-product', {
        rows: both
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

// Post method requests

app.post('/brands', function (req, res) {
  console.log(req.body);
  client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('" + req.body.brand_name + "','" + req.body.brand_description + "')");
  res.redirect('/brands');
});

app.post('/categories', function (req, res) {
  client.query("INSERT INTO products_category (product_category_name) VALUES ('" + req.body.product_category_name + "')");

  res.redirect('/categories');
});

app.post('/insert_products', function (req, res) {
  client.query("INSERT INTO products (name,description,tagline,price,warranty,brand_id,category_id,image) VALUES ('" + req.body.name + "', '" + req.body.description + "', '" + req.body.tagline + "', '" + req.body.price + "', '" + req.body.warranty + "', '" + req.body.brand_id + "', '" + req.body.category_id + "','" + req.body.image + "')")
    .then((results) => {
      console.log('results?', results);
      res.redirect('/products');
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

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
              pass: 'team20-module1'
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

app.post('/updateproduct/:id', function (req, res) {
  client.query("UPDATE products SET name = '" + req.body.products_name + "', description = '" + req.body.products_description + "', tagline = '" + req.body.products_tagline + "', price = '" + req.body.products_price + "', warranty = '" + req.body.products_warranty + "',brand_id = '" + req.body.brand_name + "', category_id = '" + req.body.category_name + "', image = '" + req.body.products_image + "'WHERE id = '" + req.params.id + "' ;");
  client.query("UPDATE brands SET brand_description = '" + req.body.brand_description + "' WHERE id ='" + req.params.id + "';");

  res.redirect('/products');
});

// Displaying list of data in client side

app.get('/products', (req, res) => {
  client.query('SELECT * FROM Products;', (req, data) => {
    var list = [];

    for (var i = 0; i < data.rows.length; i++) {
      list.push(data.rows[i]);
    }
    res.render('products', {
      data: list,
      title: 'Most Popular Shoes'
    });
  });
});

app.get('/brands', function (req, res) {
  client.query('SELECT * FROM brands')
    .then((result) => {
      console.log('results?', result);
      res.render('brands', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/categories', function (req, res) {
  client.query('SELECT * FROM products_category')
    .then((result) => {
      console.log('results?', result);
      res.render('categories', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/customers', function (req, res) {
  client.query('SELECT * FROM customers ORDER BY id DESC')
    .then((result) => {
      console.log('results?', result);
      res.render('customers', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/customers/:id', function (req, res) {
  client.query("SELECT customers.first_name AS first_name, customers.middle_name AS middle_name, customers.last_name AS last_name, customers.email AS email, customers.state AS state, customers.city AS city, customers.street AS street, customers.zipcode AS zipcode, products.name AS product_name, orders.quantity AS quantity, orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON orders.customer_id=customers.id INNER JOIN products ON orders.product_id=products.id WHERE customers.id = '" + req.params.id + "' ORDER BY purchase_date DESC;")
    .then((result) => {
      console.log('results?', result);
      res.render('customer-details', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/orders', function (req, res) {
  client.query('SELECT customers.first_name AS first_name, customers.middle_name AS middle_name, customers.last_name AS last_name, customers.email AS email, products.name AS products_name, orders.purchase_date AS purchase_date, orders.quantity AS quantity FROM orders INNER JOIN products ON orders.product_id=products.id INNER JOIN customers ON orders.customer_id=customers.id ORDER BY purchase_date DESC;')
    .then((result) => {
      console.log('results?', result);
      res.render('orders', result);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/product/update/:id', function (req, res) {
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
  client.query('SELECT products.id AS products_id, products.image AS products_image, products.name AS products_name, products.description AS products_description, products.tagline AS products_tagline, products.price AS products_price, products.warranty AS products_warranty, brands.brand_name AS brand_name, brands.brand_description AS brand_description, products_category.product_category_name AS category_name FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = ' + req.params.id + '; ')
    .then((result) => {
      res.render('update-products', {
        rows: result.rows[0],
        brand: both
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/products/:id', function (req, res) {
  client.query('SELECT products.id AS products_id, products.image AS products_image, products.name AS products_name, products.description AS products_description, products.tagline AS products_tagline, products.price AS products_price, products.warranty AS products_warranty, brands.brand_name AS brand_name, brands.brand_description AS brand_description, products_category.product_category_name AS category_name FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = ' + req.params.id + '; ')
    .then((results) => {
      console.log('results?', results);
      res.render('product-details', {
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


app.get('/admin/products', function (req, res) {
  client.query('SELECT products.id AS products_id, products.image AS products_image, products.name AS products_name, products.description AS products_description, products.tagline AS products_tagline, products.price AS products_price, products.warranty AS products_warranty, brands.brand_name AS brand_name, brands.brand_description AS brand_description, products_category.product_category_name AS category_name FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = ' + req.params.id + '; ')
    .then((results) => {
      console.log('results?', results);
      res.render('admin-products', {
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


// Server
app.listen(app.get('port'), function () {
  console.log('Server started at port 3000');
});
