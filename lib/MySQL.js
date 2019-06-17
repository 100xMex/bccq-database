// See: https://www.npmjs.com/package/promise-mysql
// See: https://www.npmjs.com/package/mysql

const PromiseMySQL = require('promise-mysql');
const MySQL = require('mysql');

let connectionInstance = null;

let host = '127.0.0.1';
let port = 3306;
let user = 'root';
let password = '123456';
let database = 'test';
let connectionLimit = 10;

/**
 * 设置配置参数
 *
 * @param config
 */
const setConfig = (config) => {
  config.host && (host = config.host);
  config.port && (port = config.port);
  config.user && (user = config.user);
  config.password && (password = config.password);
  config.database && (database = config.database);

  config.connectionLimit && (connectionLimit = config.connectionLimit);
  console.log('Set MySQL config', host, port, user, password, database);
};
exports.setConfig = setConfig;

// ins ins_pool async async_pool
const setConnectionType = (type) => {
  connectionInstance && (connectionInstance.__type__ = type);
};
const getConnectionType = () => (connectionInstance ? connectionInstance.__type__ : '');

/**
 * 异步获取 MySQL 链接实例
 *
 * @param next
 */
const getInstance = (next) => {
  if (connectionInstance) {
    return next(null, connectionInstance);
  }

  connectionInstance = MySQL.createConnection({
    host,
    port,
    user,
    password,
    database,
  });
  setConnectionType('ins');
  connectionInstance.connect((err) => {
    if (err) {
      console.error(`error connecting: ${err.stack}`);
      return;
    }
    console.log(`connected as id ${connectionInstance.threadId}`);
  });

  next(null, connectionInstance);
};
exports.getInstance = getInstance;

/**
 * 从连接池异步获取 MySQL 链接实例
 *
 * @param next
 */
const getPoolInstance = (next) => {
  if (!connectionInstance) {
    connectionInstance = MySQL.createPool({
      connectionLimit,
      host,
      port,
      user,
      password,
      database,
    });
    connectionInstance.on('acquire', (connection) => {
      console.log('MySQL Connection %d acquired', connection.threadId);
    });
    connectionInstance.on('connection', (connection) => {
      // connection.query('SET SESSION auto_increment_increment=1');
      console.log('MySQL Connection connected');
    });
    connectionInstance.on('enqueue', () => {
      console.log('MySQL Waiting for available connection slot');
    });
    connectionInstance.on('release', (connection) => {
      console.log('MySQL Connection %d released', connection.threadId);
    });
    setConnectionType('ins_pool');
  }

  connectionInstance.getConnection((err, connection) => {
    if (err) return next(err);
    next(null, connection);
  });
};
exports.getPoolInstance = getPoolInstance;

/**
 * 同步获取 MySQL 链接实例
 *
 * @returns {Promise<any>}
 */
const getInstanceAsync = async () => {
  if (connectionInstance) {
    return connectionInstance;
  }

  connectionInstance = await PromiseMySQL.createConnection({
    host,
    port,
    user,
    password,
    database,
  });
  console.log(`Async Connected as id ${connectionInstance.threadId}`);
  setConnectionType('async');

  return connectionInstance;
};
exports.getInstanceAsync = getInstanceAsync;

/**
 * 从连接池同步获取 MySQL 链接实例
 *
 * @returns {Promise<*>}
 */
const getPoolInstanceAsync = async () => {
  if (!connectionInstance) {
    connectionInstance = PromiseMySQL.createPool({
      host,
      user,
      port,
      password,
      database,
      connectionLimit,
    });
    connectionInstance.on('acquire', (connection) => {
      console.log('Async MySQL Connection %d acquired', connection.threadId);
    });
    connectionInstance.on('connection', (connection) => {
      // const ret = connection.query('SET SESSION auto_increment_increment=1');
      console.log('Async MySQL Connection connected');
    });
    connectionInstance.on('enqueue', () => {
      console.log('Async MySQL Waiting for available connection slot');
    });
    connectionInstance.on('release', (connection) => {
      console.log('Async MySQL Connection %d released', connection.threadId);
    });
    setConnectionType('async_pool');
  }

  return connectionInstance.getConnection();
};
exports.getPoolInstanceAsync = getPoolInstanceAsync;

/**
 * 释放连接池链接
 *
 * 如果使用连接池, 必须手动释放
 * 否则大量使用后会出现无连接可用的情况
 *
 * @param connection
 */
const releasePoolInstance = (connection) => {
  switch (getConnectionType()) {
    case 'ins':
      break;
    case 'async':
      break;
    case 'ins_pool':
      connection.release();
      break;
    case 'async_pool':
      connectionInstance.releaseConnection(connection);
      break;
    default:
      break;
  }
};
exports.releasePoolInstance = releasePoolInstance;

/**
 * 断开 MySQL 链接
 */
const closeConnections = () => {
  if (!connectionInstance || !connectionInstance.end) return;

  switch (getConnectionType()) {
    case 'ins':
      connectionInstance.end((err) => {
        if (err) console.log('Mysql connection end failed %s', err.message);
      });
      break;
    case 'async':
      connectionInstance.end((err) => {
        if (err) {
          console.log('Mysql Async connection end failed %s', err.message);
        }
      });
      break;
    case 'ins_pool':
      connectionInstance.end((err) => {
        if (err) {
          console.log('All Mysql connections end failed %s', err.message);
        }
      });
      break;
    case 'async_pool':
      connectionInstance.end((err) => {
        if (err) {
          console.log('All Async Mysql connections end failed %s', err.message);
        }
      });
      break;
    default:
      break;
  }
};
exports.closeConnections = closeConnections;
