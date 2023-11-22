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
  referenceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  debitValue: {
    type: DataTypes.INTEGER,
  },
  updatedBalance: {
    type: DataTypes.INTEGER,
  },
});

module.exports = DebitModel;
