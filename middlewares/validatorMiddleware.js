const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const validator = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let message = errors.array().map(({ msg }) => msg);
    res.status(400);
    next(new AppError(message, 400));
  }

  next();
};

module.exports = validator;
