// See: https://www.npmjs.com/package/mongodb

const MongoClient = require('mongodb').MongoClient;

let connectionInstance;

// 链接用基础配置, 可以再封装传入, 也可做成多利.
let url = 'mongodb://localhost:27017';
let dbName = 'test';
let user = 'root';
let password = '123456';
let authSource = 'admin';

/**
 * 设置配置参数
 *
 * @param config
 */
const setConfig = (config) => {
  config.url && (url = config.url);
  config.dbName && (dbName = config.dbName);
  config.user && (user = config.user);
  config.password && (password = config.password);
  config.authSource && (authSource = config.authSource);
};
exports.setConfig = setConfig;

/**
 * 异步获取 MongoDB 链接实例
 *
 * @param next
 */
const getInstance = (next) => {
  if (connectionInstance) {
    next(null, connectionInstance);
    return;
  }

  const config = {
    auto_reconnect: true,
    useNewUrlParser: true,
    authSource,
  };
  if (user) {
    config.auth = { user };
    if (password) {
      config.auth.password = password;
    }
  }

  MongoClient.connect(url, config, (err, client) => {
    if (err) {
      next(err);
      return;
    }

    console.log('Connected successfully to server');

    const databaseConnection = client.db(dbName);
    connectionInstance = databaseConnection;
    connectionInstance.client = client;

    next(null, databaseConnection);
  });
};
exports.getInstance = getInstance;

/**
 * 同步获取 MongoDB 链接实例
 *
 * @returns {Promise<any>}
 */
const getInstanceAsync = () => new Promise((resolve, reject) => {
    if (connectionInstance) {
      resolve(connectionInstance);
      return;
    }

    const config = {
      auto_reconnect: true,
      useNewUrlParser: true,
      authSource,
    };
    if (user) {
      config.auth = { user };
      if (password) {
        config.auth.password = password;
      }
    }

    MongoClient.connect(url, config, (err, client) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('Connected successfully to server');

      const databaseConnection = client.db(dbName);
      connectionInstance = databaseConnection;
      connectionInstance.client = client;

      resolve(databaseConnection);
    });
  });
exports.getInstanceAsync = getInstanceAsync;
