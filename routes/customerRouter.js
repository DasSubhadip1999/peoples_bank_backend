const express = require("express");
const {
  createCustomer,
  customerLogin,
  updateCustomer,
  getAllCustomers,
} = require("../controllers/customerController");
const { body } = require("express-validator");
const validator = require("../middlewares/validatorMiddleware");
const {
  customerAuth,
  representativeAuth,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { generateStatement } = require("../controllers/AccountController");

const customerRouter = express.Router();

customerRouter
  .route("/create-customer")
  .post(
    body("name").exists({ checkFalsy: true }).withMessage("Name is required"),
    body("email")
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage("Email is required"),
    body("password")
      .exists({ checkFalsy: true })
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should have atleast length of six"),
    validator,
    createCustomer
  );

customerRouter
  .route("/customer-login")
  .post(
    body("email")
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage("Email is required"),
    body("password")
      .exists({ checkFalsy: true })
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should have atleast length of six"),
    validator,
    customerLogin
  );

customerRouter
  .route("/update")
  .patch(customerAuth, upload.single("profilePic"), updateCustomer);

customerRouter.route("/getAll").get(representativeAuth, getAllCustomers);

customerRouter
  .route("/generate-statement")
  .post(
    body("startDate").isDate().withMessage("Start Date is required"),
    body("endDate").isDate().withMessage("End Date is required"),
    customerAuth,
    generateStatement
  );

module.exports = customerRouter;
