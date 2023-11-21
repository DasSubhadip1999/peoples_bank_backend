const jwt = require("jsonwebtoken");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const Application = require("../models/RepresentativeApplication");
const ApplicationStatus = require("../models/ApplicationStatusModel");
const Representative = require("../models/RepresentativeModel");
const sendEmail = require("../utils/sendEmail");
const emailTemplate = require("../assets/approveRepresentativeEmail");
const credentialEmail = require("../assets/credentialEmail");
const AppError = require("../utils/AppError");
const genToken = require("../shared/genToken");

const createApplication = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const application = await Application.create({ name, email });

  const applicationStatus = await ApplicationStatus.create({
    application_id: application.application_id,
  });

  const htmlEmail = emailTemplate(
    application.name,
    application.email,
    `172.27.6.96:5000/api/v1/representative-application/approve/${application.application_id}`
  );

  await sendEmail(
    process.env.OWNER_EMAIL,
    "Representative Application",
    "For Application",
    htmlEmail
  );

  res.status(201).json({
    message:
      "Application created! This application valid for 24 hours, after reviewing your application you will recieve your username and password through en email",
    data: {
      id: application.application_id,
      name: application.name,
      email: application.email,
      application_status: {
        under_review: applicationStatus.underReview,
        processing: applicationStatus.processing,
        completed: applicationStatus.completed,
        rejected: applicationStatus.rejected,
      },
      token: genToken(application.application_id),
    },
  });
});

const updateApplication = catchAsync(async (req, res, next) => {
  const allBodyQuries = Object.keys(req.body);

  if (allBodyQuries.length) {
    allBodyQuries.forEach((query) => {
      if (query !== "name" && query !== "email") {
        delete req.body[query];
      }
    });
  }

  await Application.update(req.body, {
    where: { application_id: req.application_id },
  });

  const updatedData = await Application.findAll({
    where: { application_id: req.application_id },
  });

  res.status(200).json({
    message: `Id ${req.application_id} has been updated`,
    data: updatedData.length > 0 ? updatedData[0] : {},
  });
});

const deleteApplication = catchAsync(async (req, res, next) => {
  await Application.destroy({ where: { application_id: req.application_id } });

  res
    .status(202)
    .json({ message: `Application deleted with id ${req.application_id}` });
});

const approveApplication = catchAsync(async (req, res, next) => {
  const application_id = req.params.id;
  const application = await Application.findOne({ where: { application_id } });

  if (!application) {
    return new AppError("Invalid approve url", 400);
  }

  await ApplicationStatus.update(
    {
      underReview: false,
      completed: true,
    },
    { where: { application_id } }
  );

  const representative = await Representative.create({
    name: application.name,
    email: application.email,
    password: uuidv4(),
  });

  const htmlEmail = credentialEmail(
    representative.email,
    representative.password
  );

  await sendEmail(
    application.email,
    "Credential of Representative Account",
    "For Credential",
    htmlEmail
  );

  res.sendFile(
    path.join(__dirname, "../assets/representativeAccountApproval.html")
  );
});

module.exports = {
  createApplication,
  updateApplication,
  deleteApplication,
  approveApplication,
};
