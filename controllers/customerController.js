const bcrypt = require("bcrypt");
const Customer = require("../models/CustomerModel");
const catchAsync = require("../utils/catchAsync");
const genToken = require("../shared/genToken");
const AppError = require("../utils/AppError");

const createCustomer = catchAsync(async (res, res, next) => {
  const { name, email, password } = req.body;

  const customerExists = await Customer.findOne({ where: { email } });

  if (customerExists) {
    return next(
      new AppError("This email is already linked to another account", 400)
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const customer = await Customer.create({
    name,
    email,
    password: hashedPassword,
    accountNumber: generateAccountNumber(),
  });

  res.status(201).json({
    message: "Account created successfully",
    data: {
      name: customer.name,
      email: customer.email,
      accountNumber: customer.accountNumber,
      token: genToken(customer.id),
    },
  });
});

const customerLogin = catchAsync(async (res, res, next) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ where: { email } });

  if (!customer) {
    return next(new AppError("No account found with this email", 404));
  }

  if (await bcrypt.compare(password, customer.password)) {
    return res.status(200).json({
      ...customer,
      token: genToken(customer.id),
    });
  } else {
    return next(new AppError("Invalid credentials", 400));
  }
});

const updateCustomer = catchAsync(async (req, res, next) => {
  const { email, profilePic } = req.body;

  await Customer.update(
    { email, profilePic },
    { where: { id: req.customer.id } }
  );

  const newCustomer = await Customer.findOne({
    where: { id: req.customer.id },
  });

  res
    .status(202)
    .json({ message: "Your details updated successfully", data: newCustomer });
});

const generateAccountNumber = () => {
  const branch_code = process.env.BRANCH_CODE;
  const randomNumber = Math.floor(Math.random() * 90000) + 10000;
  const accountNumber = `${branch_code}${randomNumber}`;
  return Number(accountNumber);
};

module.exports = {
  createCustomer,
  customerLogin,
  updateCustomer,
};
