var Product = {
  getById: (client, productId, callback) => {
    const productQuery = `SELECT products.id AS products_id,
        products.name AS products_name,
        products.image AS products_image,
        products.description AS products_description,
        products.price AS products_price,
        products.tagline AS products_tagline,
        products.warranty AS products_warranty,
        brands.brand_name AS brand_name,
        brands.brand_description AS brand_description,
        products_category.product_category_name AS category_name
      FROM products
      INNER JOIN brands ON products.brand_id = brands.id
      INNER JOIN products_category ON products.category_id = products_category.id
      WHERE products.id = ${productId}
      ORDER BY products_id ASC
    `;
    client.query(productQuery, (req, data) => {
      console.log(req);
      console.log(data.rows[0]);
      var productData = {
        id: data.rows[0].products_id,
        name: data.rows[0].products_name,
        description: data.rows[0].products_description,
        image: data.rows[0].products_image,
        price: data.rows[0].products_price,
        tagline: data.rows[0].products_tagline,
        warranty: data.rows[0].products_price,
        brandname: data.rows[0].brand_name,
        branddescription: data.rows[0].brand_description,
        category: data.rows[0].category_name
      };
      callback(productData);
    });
  },

  list: (client, filter, callback) => {
    const productListQuery = 'SELECT * FROM Products';
    client.query(productListQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  mostOrderedProduct: (client, filter, callback) => {
    const query = `
      SELECT products.name AS products_name,
      ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) DESC) AS ROW,
      SUM(orders.quantity) AS TOTAL
      FROM orders
      INNER JOIN products ON orders.product_id = products.id
      GROUP BY products_name
      ORDER BY SUM(orders.quantity) DESC
      LIMIT 10;
    `;
    client.query(query, (req,result) => {
      // console.log(result.rows);
      callback(result.rows)
    });
  },

  leastOrderedProduct: (client, filter, callback) => {
    const query = `
      SELECT products.name AS products_name,
      ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) ASC) AS ROW,
      SUM(orders.quantity) AS TOTAL
      FROM orders
      INNER JOIN products ON orders.product_id = products.id
      GROUP BY products_name
      ORDER BY SUM(orders.quantity) ASC
      LIMIT 10;
    `;
    client.query(query, (req,result) => {
      // console.log(result.rows);
      callback(result.rows)
    });
  }
};

module.exports = Product;