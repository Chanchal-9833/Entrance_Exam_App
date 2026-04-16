const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("./config/db");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/auth", require("./routes/auth"));
app.use("/exam", require("./routes/exam"));
app.use("/admin", require("./routes/admin"));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});