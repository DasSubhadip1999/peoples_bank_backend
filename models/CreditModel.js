const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const CreditModel = sequelize.define("credit", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  creditValue: {
    type: DataTypes.INTEGER,
  },
});

module.exports = CreditModel;
