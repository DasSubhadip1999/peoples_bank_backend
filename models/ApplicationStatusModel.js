const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const applicationStatusModel = sequelize.define("applicationStatus", {
  applicationStatus_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  underReview: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  processing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rejected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = applicationStatusModel;
