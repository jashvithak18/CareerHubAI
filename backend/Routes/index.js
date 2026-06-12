const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");
const application = require("./application");
const user = require("./user");
const resume = require("./resume");
const payment = require("./payment");
const settings = require("./settings");

router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);
router.use("/user", user);
router.use("/resume", resume);
router.use("/payment", payment);
router.use("/settings", settings);

module.exports = router;
