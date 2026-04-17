const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  name: String,
  email: String,
  college: String,
  score: Number,
  total: Number,
  paperId: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Result", resultSchema);