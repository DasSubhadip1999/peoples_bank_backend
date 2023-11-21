const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const Application = require("../models/RepresentativeApplication");
const ApplicationStatus = require("../models/ApplicationStatusModel");

const createApplication = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const application = await Application.create({ name, email });

  const applicationStatus = await ApplicationStatus.create({
    application_id: application.application_id,
  });

  res.status(201).json({
    message: "Application created",
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

const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

module.exports = {
  createApplication,
  updateApplication,
  deleteApplication,
};
