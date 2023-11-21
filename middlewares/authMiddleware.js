const jwt = require("jsonwebtoken");
const Application = require("../models/RepresentativeApplication");
const Customer = require("../models/CustomerModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const applicationAuth = catchAsync(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer")) {
    token = header.split(" ")[1];

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const application = await Application.findOne({
      where: { application_id: decode.id },
    });

    if (!application) {
      next(new AppError("No Application found", 404));
    }

    req.application_id = application.application_id;

    next();
  } else {
    next(new AppError("No token in headers", 401));
  }
});

const customerAuth = catchAsync(async (res, res, next) => {
  let token;

  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer")) {
    token = header.split(" ")[1];

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findOne({ where: { id: decode.id } });

    req.customer = customer;

    next();
  } else {
    next(new AppError("No token in headers", 401));
  }
});

module.exports = {
  applicationAuth,
  customerAuth,
};
