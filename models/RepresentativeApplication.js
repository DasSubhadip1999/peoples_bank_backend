const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const RepresentativeApplicationModel = sequelize.define("rpApplication", {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});
