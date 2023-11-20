const catchAsync = require("../utils/catchAsync");
const dbConfig = require("./dbConfig");

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, "", {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const connectDB = catchAsync(async () => {
  await sequelize.authenticate();
  console.log(
    `DB Connection has been established successfully.`.green.underline
  );
});

const reSync = catchAsync(async () => {
  await sequelize.sync({ force: false });
  console.log(`DB re-sync completed`.cyan.bold);
});

reSync();

module.exports = {
  connectDB,
  sequelize,
};
