const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  education: String,
  college: String,
  email: String,
  otp: String,
  verified: Boolean
});

module.exports = mongoose.model("Student", studentSchema);