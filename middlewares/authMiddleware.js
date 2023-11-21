const jwt = require("jsonwebtoken");
const Application = require("../models/RepresentativeApplication");
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

module.exports = {
  applicationAuth,
};
