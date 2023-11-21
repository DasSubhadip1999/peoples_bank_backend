const Customer = require("../models/customerModel");
const Account = require("../models/AccountDetailsModel");
const Credit = require("../models/CreditModel");
const catchAsync = require("../utils/catchAsync");

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

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been credited with ₹${amount}`,
  });
});

module.exports = {
  deposit,
};
