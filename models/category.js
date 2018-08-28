var Category = {
  list: (client, filter, callback) => {
    const categoryListQuery = `
      SELECT * FROM products_category
      `;
    client.query(categoryListQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    })
  }
};
module.exports = Category;