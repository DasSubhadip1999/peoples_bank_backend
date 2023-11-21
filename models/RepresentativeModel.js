const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/dbConnection");

const RepresentativeModel = sequelize.define("representative", {
  id: {
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
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  profilePic: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue:
      "https://i.pinimg.com/474x/76/4d/59/764d59d32f61f0f91dec8c442ab052c5.jpg",
  },
});

module.exports = RepresentativeModel;
