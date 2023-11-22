const express = require("express");
const { body } = require("express-validator");
const { deposit, withdraw } = require("../controllers/AccountController");
const validator = require("../middlewares/validatorMiddleware");
const { customerAuth } = require("../middlewares/authMiddleware");

const accountRouter = express.Router();

accountRouter
  .route("/deposit")
  .post(
    body("amount")
      .exists({ checkFalsy: true })
      .isNumeric()
      .withMessage("Amount is required"),
    validator,
    customerAuth,
    deposit
  );

accountRouter
  .route("/withdraw")
  .post(
    body("amount")
      .exists({ checkFalsy: true })
      .isNumeric()
      .withMessage("Amount is required"),
    validator,
    customerAuth,
    withdraw
  );

module.exports = accountRouter;
