const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  duration: Number // in minutes
});

module.exports = mongoose.model("Config", configSchema);