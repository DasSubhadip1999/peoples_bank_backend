const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const AccountDetailsModel = sequelize.define("accountdetail", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  balance: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = AccountDetailsModel;
