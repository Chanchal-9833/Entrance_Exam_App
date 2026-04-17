const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Question = require("../models/question");
const Result = require("../models/result");
const transporter = require("../config/mail");

//get papers
router.get("/papers", async (req, res) => {
  try {
    const papers = await Question.distinct("paperId");
    res.send(papers);
  } catch (err) {
    res.status(500).send({ message: "Error fetching papers" });
  }
});
//get Questions
router.get("/questions/:paperId", async (req, res) => {
  try {
    const questions = await Question.find({
      paperId: req.params.paperId
    });

    res.send(questions);
  } catch (err) {
    res.status(500).send({ message: "Error fetching questions" });
  }
});

// Submit Exam
router.post("/submit", async (req, res) => {
  const { email, answers, paperId } = req.body;

  const student = await Student.findOne({ email });

  if (!student) {
    return res.status(400).send({ message: "User not found" });
  }

  if (!student.verified) {
    return res.status(403).send({ message: "User not verified" });
  }

  // ✅ ONLY THIS PAPER
  const questions = await Question.find({ paperId });

  let score = 0;

  // 🔥 SECTION-WISE TRACKING
  let sectionScores = {};   // { A: {score, total}, B: {...} }

  questions.forEach(q => {
    if (!sectionScores[q.section]) {
      sectionScores[q.section] = { score: 0, total: 0 };
    }
    sectionScores[q.section].total++;
  });

  // 🔥 CHECK ANSWERS
  answers.forEach(a => {
    const q = questions.find(q => q._id.toString() === a.questionId);

    if (q) {
      if (a.answer === q.correctAnswer) {
        score++;
        sectionScores[q.section].score++;
      }
    }
  });

  // SAVE RESULT
  const result = new Result({
    name: student.name,
    email: student.email,
    college: student.college,
    score,
    total: questions.length,
    paperId,
    sectionScores   // 🔥 SAVE
  });

  await result.save();

  // 📧 EMAIL
  try {
    let sectionText = "";

    for (let sec in sectionScores) {
      sectionText += `Section ${sec}: ${sectionScores[sec].score}/${sectionScores[sec].total}\n`;
    }

    await transporter.sendMail({
      from: "YOUR_EMAIL@gmail.com",
      to: student.email,
      subject: "Your Exam Result",
      text: `Dear ${student.name},

Your exam (${paperId}) has been completed.

Total Score: ${score}/${questions.length}

Section-wise Performance:
${sectionText}

Thank you,
Exam Team`
    });

  } catch (err) {
    console.error("❌ Email error:", err);
  }

  // 🔥 SEND TO FRONTEND
  res.send({
    score,
    total: questions.length,
    sectionScores
  });
});

const Config = require("../models/config");

router.get("/duration", async (req, res) => {
  const config = await Config.findOne();
  res.send({ duration: config?.duration || 30 });
});
module.exports = router;