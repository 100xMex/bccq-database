const mysql = require("../lib/MySQL");
const config = require('./config/mysql');
mysql.setConfig(config);

const orderInfo = {
  username: "john",
  phone: "+8610-123456",
  email: "john@gmail.com",
  ga: "",
  idcard: "",
  passport: "",
  vip: 0,
  created: new Date()
};

const asyncDemo = async () => {
  // const connection = await mysql.getPoolInstanceAsync();
  const connection = await mysql.getInstanceAsync();

  connection.query('INSERT INTO user_info SET ?', orderInfo)
    .then(query => {
      console.log(query);
    })
    .error(err => {
      console.log(err);
    })
    .finally(() => {
      mysql.releasePoolInstance(connection);
      mysql.closeConnections();
    });
};

const syncDemo = () => {
  // mysql.getPoolInstance((err, connection) => {
  mysql.getInstance((err, connection) => {
    if (err) return console.log(err.message);

    connection.query('INSERT INTO user_info SET ?', orderInfo, (err, query) => {
      mysql.releasePoolInstance(connection);
      mysql.closeConnections();

      if (err) return console.log(err);
      console.log(query);
    });
  });
};

asyncDemo();
syncDemo();
