const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chanchal29122006@gmail.com",
    pass: "bjnh zxtr ffwg rhhr"
  }
});

module.exports = transporter;