const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text, html) => {
  const auth = {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.APP_PASSWORD,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth,
  });

  try {
    const info = await transporter.sendMail({
      from: auth.user,
      to: email,
      subject,
      text,
      html,
    });

    return info.messageId;
  } catch (error) {
    console.log("mail error", error);
    return error;
  }
};

module.exports = sendEmail;
