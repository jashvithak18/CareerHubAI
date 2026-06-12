require("dotenv").config();
const bodyparser = require("body-parser");
const express = require("express");
const app = express();

// Global error logger for diagnostics
global.errorLog = [];
global.logError = (type, err) => {
  global.errorLog.push({
    timestamp: new Date().toISOString(),
    type,
    message: err.message,
    stack: err.stack
  });
  if (global.errorLog.length > 50) {
    global.errorLog.shift();
  }
};
const cors = require("cors");
const { connect } = require("./db");
const router = require("./Routes/index");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello this is CareerHub AI backend");
});
app.use("/api", router);
connect();
app.use((req, res, next) => {
  req.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
