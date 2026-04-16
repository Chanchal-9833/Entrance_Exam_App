const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const transporter = require("../config/mail");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
router.post("/register", async (req, res) => {
  const { name, age, education, college, email } = req.body;

  const otp = generateOTP();

  let student = await Student.findOne({ email });

  if (student) {
    // Update OTP only
    student.otp = otp;
  } else {
    // Create new student
    student = new Student({
      name,
      age,
      education,
      college,
      email,
      otp,
      verified: false
    });
  }

  await student.save();

  await transporter.sendMail({
    to: email,
    subject: "OTP Verification for the Exam portal",
    text: `Your OTP is ${otp}`
  });

  res.send({ message: "OTP sent" });
});
// Verify OTP
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  const student = await Student.findOne({ email });

  if (!student) {
    return res.send({ message: "User not found" });
  }

  if (student.otp === otp) {
    student.verified = true;
    student.otp = null; // clear OTP after use
    await student.save();

    res.send({ message: "Verified" });
  } else {
    res.send({ message: "Invalid OTP" });
  }
});

router.post("/check", async (req, res) => {
  const { email } = req.body;

  const student = await Student.findOne({ email });

  if (!student) {
    return res.send({ verified: false });
  }

  res.send({ verified: student.verified });
});

module.exports = router;