var Order = {
  list: (client, filter, callback) => {
    const orderListQuery = `
      SELECT
        customers.first_name AS first_name,
        customers.middle_name As middle_name,
        customers.last_name AS last_name,
        customers.email AS email,
        products.name AS products_name,
        orders.purchase_date AS purchase_date,
        orders.quantity AS quantity
      FROM orders
      INNER JOIN products ON orders.product_id = products.id
      INNER JOIN customers ON orders.customer_id = customers.id
      ORDER BY purchase_date DESC
    `;
    client.query(orderListQuery, (req, res) => {
      console.log(data.rows);
      callback(data.rows);
    });
  }
};
module.exports = Order;
