const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const ApplicationModel = sequelize.define("application", {
  application_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
});

module.exports = ApplicationModel;
