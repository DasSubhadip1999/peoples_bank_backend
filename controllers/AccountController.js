const Customer = require("../models/customerModel");
const Account = require("../models/AccountDetailsModel");
const Credit = require("../models/CreditModel");
const Debit = require("../models/DebitModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const deposit = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  await Account.increment("balance", {
    by: amount,
    where: { accountNumber: customer.accountNumber },
  });

  await Credit.create({
    creditValue: amount,
    accountNumber: customer.accountNumber,
  });

  const lastFourDigit = `${customer.accountNumber}`.slice(-4);

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been credited with ₹${amount}, available balance is ₹${
      +account.balance + +amount
    }`,
  });
});

const withdraw = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  if (!(amount >= account.balance))
    return next(
      new AppError("Your account does not have sufficient balance", 400)
    );

  await Account.decrement("balance", {
    by: amount,
    where: { accountNumber: account.accountNumber },
  });

  await Debit.create({
    accountNumber: account.accountNumber,
    debitValue: amount,
  });

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been debited with ₹${amount}, available balance is ₹${
      +account.balance - +amount
    }`,
  });
});

const generateStatement = catchAsync(async (req, res, next) => {});

module.exports = {
  deposit,
  withdraw,
  generateStatement,
};
