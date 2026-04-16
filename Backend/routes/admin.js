const express = require("express");
const router = express.Router();

const Result = require("../models/result");
const Config = require("../models/config"); //
const Question = require("../models/question");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

// Upload JSON file
router.post("/upload-json", upload.single("file"), async (req, res) => {
  try {
    const fs = require("fs");

    const data = fs.readFileSync(req.file.path);
    const questions = JSON.parse(data);

    await Question.insertMany(questions);

    res.send({ message: "Questions uploaded successfully" });
  } catch (err) {
    res.send({ error: err.message });
  }
});

// Existing route
router.post("/add-question", async (req, res) => {
  const question = new Question(req.body);
  await question.save();
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
    const results = await Result.find();
    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to load data" });
  }
});
module.exports = router;