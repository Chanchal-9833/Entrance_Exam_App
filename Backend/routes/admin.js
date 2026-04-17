const express = require("express");
const router = express.Router();

const Result = require("../models/result");
const Config = require("../models/config"); //
const Question = require("../models/question");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

// Upload JSON file
router.post("/upload-json", upload.single("file"), async (req, res) => {
  const fs = require("fs");

  const data = JSON.parse(fs.readFileSync(req.file.path));

  const paperId = req.body.paperId;
  const sectionFromUI = req.body.section;

  const questions = data.map(q => ({
    ...q,
    paperId,
    section: sectionFromUI || q.section   // ✅ KEY LOGIC
  }));

  await Question.insertMany(questions);

  res.send({ message: "Questions uploaded successfully" });
});

router.post("/add-question", async (req, res) => {
  const { paperId, question, options, correctAnswer, subject } = req.body;

  const q = new Question({
    paperId,   
    options,
    correctAnswer,
    subject
  });

  await q.save();

  res.send({ message: "Question added" });
});



// Set duration
router.post("/set-duration", async (req, res) => {
  const { duration } = req.body;

  let config = await Config.findOne();

  if (!config) {
    config = new Config({ duration });
  } else {
    config.duration = duration;
  }

  await config.save();

  res.send({ message: "Duration set successfully" });
});



router.get("/results", async (req, res) => {
  try {
    const results = await Result.find().sort({ _id: -1 });
    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to load data" });
  }
});
router.get("/results/:paperId", async (req, res) => {
  const results = await Result.find({ paperId: req.params.paperId });
  res.send(results);
});
module.exports = router;