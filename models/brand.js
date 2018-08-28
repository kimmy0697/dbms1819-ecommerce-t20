var Brand {
  list: (client, filter, callback) => {
    console.log(req);
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