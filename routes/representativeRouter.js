const express = require("express");
const { body } = require("express-validator");
const validator = require("../middlewares/validatorMiddleware");
const {
  resetPassword,
  login,
} = require("../controllers/representativeController");

const representativeRouter = express.Router();

representativeRouter
  .route("/login")
  .post(
    body("email")
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage("Email is required"),
    body("password")
      .exists({ checkFalsy: true })
      .withMessage("Password is required"),
    validator,
    login
  );

representativeRouter
  .route("/reset-password/:token")
  .post(
    body("password")
      .exists({ checkFalsy: true })
      .withMessage("password cannot be empty"),
    validator,
    resetPassword
  );

module.exports = representativeRouter;
