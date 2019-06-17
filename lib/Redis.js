

// See: https://www.npmjs.com/package/redis

const Redis = require('redis');
const BlueBird = require('bluebird');

BlueBird.promisifyAll(Redis.RedisClient.prototype);
BlueBird.promisifyAll(Redis.Multi.prototype);

let connectionInstance = null;

let host = '127.0.0.1';
let port = 6379;
let db = null;
let password = null;

let string_numbers = null;
let return_buffers = false;
let no_ready_check = false;
let rename_commands = null; // {origin: alias, ...}

/**
 * 设置配置参数
 *
 * @param config
 */
exports.setConfig = (config) => {
  config.host && (host = config.host);
  config.port && (port = config.port);
  config.db && (db = config.db);
  config.password && (password = config.password);

  config.string_numbers && (string_numbers = config.string_numbers);
  config.return_buffers && (return_buffers = config.return_buffers);
  config.no_ready_check && (no_ready_check = config.no_ready_check);
  config.rename_commands && (rename_commands = config.rename_commands);
};
exports.setConfig = setConfig;

/**
 * 异步获取 Redis 链接实例
 * @param next
 */
const getInstance = (next) => {
  if (connectionInstance) {
    next(null, connectionInstance);
    return;
  }

  const options = { host, port };

  db && (options.db = db);
  password && (options.password = password);

  string_numbers && (options.string_numbers = string_numbers);
  return_buffers && (options.return_buffers = return_buffers);
  no_ready_check && (options.no_ready_check = no_ready_check);
  rename_commands && (options.rename_commands = rename_commands);

  connectionInstance = Redis.createClient(options);

  connectionInstance.on('ready', (...argv) => {
    console.log('ready %j', ...argv);
  });
  connectionInstance.on('connect', (...argv) => {
    console.log('connect %j', ...argv);
  });
  connectionInstance.on('reconnecting', (...argv) => {
    console.log('reconnecting %j', ...argv);
  });
  connectionInstance.on('error', (...argv) => {
    console.log('error %j', ...argv);
  });
  connectionInstance.on('end', (...argv) => {
    console.log('end %j', ...argv);
  });
  connectionInstance.on('warning', (...argv) => {
    console.log('warning %j', ...argv);
  });

  next(null, connectionInstance);
};
exports.getInstance = getInstance;

/**
 * 同步获取 Redis 链接实例
 * @returns {Promise<*>}
 */
const getInstanceAsync = async () => {
  if (connectionInstance) return connectionInstance;

  const options = { host, port };

  db && (options.db = db);
  password && (options.password = password);

  string_numbers && (options.string_numbers = string_numbers);
  return_buffers && (options.return_buffers = return_buffers);
  no_ready_check && (options.no_ready_check = no_ready_check);
  rename_commands && (options.rename_commands = rename_commands);

  connectionInstance = await Redis.createClient(options);

  connectionInstance.on('connect', () => {
    console.log('connect to redis');
  });
  connectionInstance.on('ready', () => {
    console.log('redis ready');
  });
  connectionInstance.on('reconnecting', (...argv) => {
    console.log('reconnecting %j', ...argv);
  });
  connectionInstance.on('error', (...argv) => {
    console.log('error %j', ...argv);
  });
  connectionInstance.on('end', (...argv) => {
    console.log('end %j', ...argv);
  });
  connectionInstance.on('warning', (...argv) => {
    console.log('warning %j', ...argv);
  });

  return connectionInstance;
};
exports.getInstanceAsync = getInstanceAsync;

if (require.main === module) {
  (async () => {
    const ins = await exports.getInstanceAsync();
    const ret = await ins.setAsync('aaa', 'bbb');
    console.log(ret);
  })();
}
