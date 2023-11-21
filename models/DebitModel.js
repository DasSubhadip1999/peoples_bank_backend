const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const DebitModel = sequelize.define("debit", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  debitValue: {
    type: DataTypes.INTEGER,
  },
});

module.exports = DebitModel;
