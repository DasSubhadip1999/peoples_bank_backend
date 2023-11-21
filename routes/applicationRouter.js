const express = require("express");
const { body } = require("express-validator");
const validator = require("../middlewares/validatorMiddleware");
const {
  createApplication,
  updateApplication,
  deleteApplication,
  approveApplication,
} = require("../controllers/representativeApplicationController");
const { applicationAuth } = require("../middlewares/authMiddleware");

const applicationRouter = express.Router();

applicationRouter
  .route("/create")
  .post(
    body("name")
      .exists({ checkFalsy: true })
      .withMessage("name field required"),
    body("email")
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage("Enter a valid email"),
    validator,
    createApplication
  );

applicationRouter.route("/update").put(applicationAuth, updateApplication);

applicationRouter.route("/delete").delete(applicationAuth, deleteApplication);

applicationRouter.route("/approve/:id").get(approveApplication);

module.exports = applicationRouter;
