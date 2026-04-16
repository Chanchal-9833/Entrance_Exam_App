const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Question = require("../models/question");
const Result = require("../models/result");
const transporter = require("../config/mail");

// Get Questions
router.get("/questions", async (req, res) => {
  const questions = await Question.find();
  res.send(questions);
});

// Submit Exam

router.post("/submit", async (req, res) => {
  const { email, answers } = req.body;

  const student = await Student.findOne({ email });

   if (!student) {
    return res.status(400).send({ message: "User not found" });
  }

  
  if (!student.verified) {
    return res.status(403).send({ message: "User not verified" });
  }

    const questions = await Question.find();
  let score = 0;



answers.forEach(a => {
  const q = questions.find(q => q._id.toString() === a.questionId);

  if (q && a.answer === q.correctAnswer) {
    score++;
  }
});
  const result = new Result({
    name: student.name,
    email: student.email,
    college: student.college,
    score,
    total: questions.length
  });

  await result.save();

 
  try {
    console.log("📧 Sending email to:", student.email);

    await transporter.sendMail({
  from: "YOUR_EMAIL@gmail.com",
  to: student.email,
  subject: "Your Exam Result",
  text: `Dear ${student.name},

Your exam has been successfully completed.

Here are your results:
Score: ${score} out of ${questions.length}

Thank you for participating.

Best regards,
Exam Team`
});

    console.log("✅ Email sent successfully");

  } catch (err) {
    console.error("❌ Email error:", err);
  }

  res.send({ score, total: questions.length });
});

const Config = require("../models/config");

router.get("/duration", async (req, res) => {
  const config = await Config.findOne();
  res.send({ duration: config?.duration || 30 });
});
module.exports = router;