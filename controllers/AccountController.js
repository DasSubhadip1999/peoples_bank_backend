const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Customer = require("../models/customerModel");
const Account = require("../models/AccountDetailsModel");
const Credit = require("../models/CreditModel");
const Debit = require("../models/DebitModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
const generatePdf = require("../utils/generatePdf");

const deposit = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  await Account.increment("balance", {
    by: amount,
    where: { accountNumber: customer.accountNumber },
  });

  const credit = await Credit.create({
    creditValue: amount,
    accountNumber: customer.accountNumber,
    referenceId: generateReferenceId(),
  });

  const lastFourDigit = `${customer.accountNumber}`.slice(-4);

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  await Credit.update(
    { updatedBalance: +account.balance + +amount },
    { where: { accountNumber: account.accountNumber } }
  );

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been credited with ₹${amount}, available balance is ₹${
      +account.balance + +amount
    }. Reference ID for this transaction is ${credit.referenceId}`,
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

  const debit = await Debit.create({
    accountNumber: account.accountNumber,
    debitValue: amount,
    referenceId: generateReferenceId(),
    updatedBalance: +account.balance - +amount,
  });

  res.status(200).json({
    message: `Your account number XXXXX${lastFourDigit} has been debited with ₹${amount}, available balance is ₹${
      +account.balance - +amount
    }. Reference ID for this transaction is ${debit.referenceId}`,
  });
});

const generateStatement = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.body;

  const customer = await Customer.findOne({ where: { id: req.customer.id } });

  const account = await Account.findOne({
    where: { accountNumber: customer.accountNumber },
  });

  const credit = await Credit.findAll({
    where: {
      accountNumber: account.accountNumber,
      updatedAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    order: [["updatedAt", "DESC"]],
  });

  const debit = await Debit.findAll({
    where: {
      accountNumber: account.accountNumber,
      updatedAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    order: [["updatedAt", "DESC"]],
  });

  const statementObject = {
    credit,
    debit,
  };

  const password =
    customer.name.slice(0, 4) + `${customer.accountNumber}`.slice(0, 4);

  await generatePdf(statementObject, password, customer.accountNumber);

  const filePath = path.join(
    __dirname,
    `statements/${customer.accountNumber}.pdf`
  );

  await fs.stat(filePath);

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    `Content-Disposition", "attachment; filename=${customer.accountNumber}.pdf`
  );

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

const generateReferenceId = () => {
  return uuidv4();
};

module.exports = {
  deposit,
  withdraw,
  generateStatement,
};
