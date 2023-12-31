require("dotenv").config();
require("colors");
const express = require("express");
const app = require("./app");
const PORT = process.env.PORT;
const { connectDB } = require("./configs/dbConnection");
const { connectRedis } = require("./configs/Redis");
const { errorHanlder } = require("./middlewares/errorHandler");
const { accessControl } = require("./middlewares/accessControl");
const AppError = require("./utils/AppError");

connectDB();
connectRedis();
//App configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(accessControl);
app.use("/uploads", express.static("uploads"));

app.use(
  "/api/v1/representative-application",
  require("./routes/applicationRouter")
);
app.use("/api/v1/representative", require("./routes/representativeRouter"));
app.use("/api/v1/customer", require("./routes/customerRouter"));
app.use("/api/v1/account", require("./routes/accountRouter"));

app.get("/", (req, res) => res.status(200).json({ message: `API is live` }));
app.all("*", (req, res, next) =>
  next(new AppError(`Could not find ${req.originalUrl} in the server`, 404))
);
//global error handler
app.use(errorHanlder);

app.listen(PORT, () => console.log(`server started on port ${PORT}`.blue));
