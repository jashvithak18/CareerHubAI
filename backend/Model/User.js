const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  photo: {
    type: String
  },
  role: { 
    type: String, 
    enum: ["student", "admin"], 
    default: "student" 
  },
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", UserSchema);
