const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const Representative = require("../models/RepresentativeModel");
const AppError = require("../utils/AppError");
const genToken = require("../shared/genToken");

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const representative = await Representative.findOne({ where: { email } });

  if (!representative) {
    return next(
      new AppError("No representative account found with this email", 404)
    );
  }

  if (await bcrypt.compare(password, representative.password)) {
    return res.status(200).json({
      message: "Login successfull",
      data: {
        name: representative.name,
        email: representative.email,
        token: genToken(representative.id),
      },
    });
  } else {
    next(new AppError("Invalid credential", 401));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const decode = jwt.verify(req.params.token, process.env.JWT_SECRET);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await Representative.update(
    { password: hashedPassword },
    { where: { id: decode.id } }
  );

  res.status(202).json({ message: "Password updated successfully" });
});

module.exports = {
  login,
  resetPassword,
};
