const mongoose = require("mongoose");
require('dotenv').config();

const url = process.env.DATABASE_URL;

module.exports.connect = () => {
  mongoose.connect(url)
    .then(() => {
      console.log("Database is connected successfully");
    })
    .catch((err) => {
      console.error("Database connection error:", err.message);
    });
};