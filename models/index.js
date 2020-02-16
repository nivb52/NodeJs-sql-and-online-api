require("dotenv").config();
const Sequelize = require("sequelize");

const sequlize = new Sequelize(
  process.env.TABLE_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: "mysql" }
);

const models = {
  Tweet: sequlize.import("./Tweet.js")
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// CONNECT TO DB:
sequlize
  .authenticate()
  .then(() => console.log("DB CONNECTED"))
  .catch(err => console.log("ERR: ", err));

// EXPORTS
models.sequlize = sequlize;
models.Sequelize = Sequelize;

module.exports = models;
