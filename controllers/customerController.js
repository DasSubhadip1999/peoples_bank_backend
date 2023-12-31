const bcrypt = require("bcrypt");
const Customer = require("../models/CustomerModel");
const Account = require("../models/AccountDetailsModel");
const catchAsync = require("../utils/catchAsync");
const genToken = require("../shared/genToken");
const AppError = require("../utils/AppError");
const Ledger = require("../models/Ledger");
const generateTransactionId = require("../shared/generateTransactionId");

const createCustomer = catchAsync(async (req, res, next) => {
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

  await Account.create({ accountNumber: customer.accountNumber });

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

const customerLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({
    where: { email },
  });

  if (!customer) {
    return next(new AppError("No account found with this email", 404));
  }

  if (await bcrypt.compare(password, customer.password)) {
    return res.status(200).json({
      name: customer.name,
      email: customer.email,
      accountNumber: customer.accountNumber,
      token: genToken(customer.id),
    });
  } else {
    return next(new AppError("Invalid credentials", 400));
  }
});

const updateCustomer = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const profilePic =
    `${process.env.BASE_URL}/${req.files.path}` ||
    "https://i.pinimg.com/474x/76/4d/59/764d59d32f61f0f91dec8c442ab052c5.jpg";

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

const getAllCustomers = catchAsync(async (req, res, next) => {
  const customers = await Customer.findAll({
    attributes: { exclude: ["password"] },
  });
  res.status(200).json({ message: "", data: customers });
});

const getCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findOne({
    where: { id: req.customer.id },
    attributes: { exclude: ["password"] },
  });
  res.status(200).json({ message: "", data: customer });
});

const generateAccountNumber = () => {
  const branch_code = process.env.BRANCH_CODE;
  const randomNumber = Math.floor(Math.random() * 90000) + 10000;
  const accountNumber = `${branch_code}${randomNumber}`;
  return Number(accountNumber);
};

const sendMoney = catchAsync(async (req, res, next) => {
  const { amount, receiverAccountNumber } = req.body;

  if (!amount || !receiverAccountNumber) {
    return next(new AppError("Please fill all details", 400));
  }

  const receiver = await Account.findOne({
    where: { accountNumber: receiverAccountNumber },
  });

  if (!receiver) {
    next(
      new AppError(
        `We can't find customer with account number ${receiverAccountNumber}`
      )
    );
  }

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  if (account.balance < amount) {
    next(new AppError(`Your account doesn't have sufficient balance`));
  }

  //deducting from senders account
  await Account.decrement("balance", {
    by: amount,
    where: { accountNumber: customer.accountNumber },
  });

  //updating banks record with debit and credit
  const debit = await Ledger.create({
    accountNumber: account.accountNumber,
    type: "debit",
    value: amount,
    transactionId: generateTransactionId(),
    updatedBalance: +account.balance - +amount,
  });

  await Ledger.create({
    accountNumber: receiverAccountNumber,
    type: "credit",
    value: amount,
    transactionId: debit.transactionId,
    updatedBalance: +receiver.balance + +amount,
  });

  //adding to receiver's account
  await Account.increment("balance", {
    by: amount,
    where: { accountNumber: receiverAccountNumber },
  });

  const updatedSendersAccount = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  res.status(200).json({
    message: `You've send ₹${amount} to ${receiver.accountNumber}. Your available balance is ${updatedSendersAccount.balance}`,
  });
});

module.exports = {
  createCustomer,
  customerLogin,
  updateCustomer,
  getAllCustomers,
  getCustomer,
  sendMoney,
};
