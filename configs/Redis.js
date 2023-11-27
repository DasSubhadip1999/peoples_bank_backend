const Redis = require("redis");

const redisClient = Redis.createClient();

const connectRedis = async () => {
  await redisClient.connect();
  redisClient.on("connect", () => console.log(`Redis connected`));
  redisClient.on("error", (err) => console.log(`Error:${err.message}`));
};

const DEFAULT_EXPIRATION = 3600;

const getOrSetInRedis = (key, cb) => {
  console.log(key, cb);
  debugger;

  return new Promise((resolve, reject) => {
    redisClient.GET(key, async (err, data) => {
      if (err) return reject(err);
      if (data != null) return resolve(JSON.parse(data));

      const newData = await cb();

      console.log("newData", newData);

      redisClient.SETEX(key, DEFAULT_EXPIRATION, JSON.stringify(newData));
      return resolve(newData);
    });
  });
};

module.exports = {
  getOrSetInRedis,
  connectRedis,
};
