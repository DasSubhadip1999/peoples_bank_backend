class ResponseFormatter {
  constructor(status, data, message, res) {
    res.status(status).json({
      data,
      message,
    });
  }
}

module.exports = ResponseFormatter;
