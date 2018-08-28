var Brand = {
  list: (client, filter, callback) => {
    const brandListQuery = `
      SELECT * FROM brands
      `;
    client.query(brandListQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    })
  }
};
module.exports = Brand;