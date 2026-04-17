const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  subject: String,
   paperId: String,
    section: String

});

module.exports = mongoose.model("Question", questionSchema);