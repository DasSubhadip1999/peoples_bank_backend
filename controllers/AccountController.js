const Customer = require("../models/CustomerModel");
const Account = require("../models/AccountDetailsModel");
const Ledger = require("../models/Ledger");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
const generateTransactionId = require("../shared/generateTransactionId");
const { getOrSetInRedis } = require("../configs/Redis");

const deposit = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  const credit = await Ledger.create({
    accountNumber: customer.accountNumber,
    transactionId: generateTransactionId(),
    type: "credit",
    value: amount,
  });

  await Account.increment("balance", {
    by: amount,
    where: { accountNumber: customer.accountNumber },
  });

  const lastFourDigit = `${customer.accountNumber}`.slice(-4);

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  await Ledger.update(
    { updatedBalance: account.balance },
    { where: { accountNumber: customer.accountNumber, id: credit.id } }
  );

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been credited with ₹${amount}, available balance is ₹${account.balance}. Reference ID for this transaction is ${credit.transactionId}`,
  });
});

const withdraw = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  if (amount > account.balance)
    return next(
      new AppError("Your account does not have sufficient balance", 400)
    );

  await Account.decrement("balance", {
    by: amount,
    where: { accountNumber: account.accountNumber },
  });

  const debit = await Ledger.create({
    accountNumber: account.accountNumber,
    type: "debit",
    value: amount,
    transactionId: generateTransactionId(),
    updatedBalance: +account.balance - +amount,
  });

  const lastFourDigit = `${customer.accountNumber}`.slice(-4);

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been debited with ₹${amount}, available balance is ₹${
      +account.balance - +amount
    }. Reference ID for this transaction is ${debit.transactionId}`,
  });
});

const generateStatement = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(new AppError("start date and end date required", 400));
  }

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  // const records = await getOrSetInRedis(
  //   `records?startDate=${startDate}&endDate=${endDate}`,
  //   async () => {
  //     const data = await Ledger.findAll({
  //       where: {
  //         accountNumber: account.accountNumber,
  //         createdAt: {
  //           [Op.between]: [new Date(startDate), new Date(endDate)],
  //         },
  //       },
  //       order: [["createdAt", "DESC"]],
  //       attributes: {
  //         exclude: ["id", "accountNumber", "updatedAt"],
  //       },
  //     });
  //     return data;
  //   }
  // );

  const records = await Ledger.findAll({
    where: {
      accountNumber: account.accountNumber,
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["id", "accountNumber", "updatedAt"],
    },
  });

  res.status(200).json({ message: "", data: records });
});

module.exports = {
  deposit,
  withdraw,
  generateStatement,
};
