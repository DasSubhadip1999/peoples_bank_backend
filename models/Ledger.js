const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const Ledger = sequelize.define("ledger", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.ENUM,
    values: ["credit", "debit"],
  },
  value: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  updatedBalance: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Ledger;
