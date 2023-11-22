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
  referenceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  creditValue: {
    type: DataTypes.INTEGER,
  },
  updatedBalance: {
    type: DataTypes.INTEGER,
  },
});

module.exports = CreditModel;
