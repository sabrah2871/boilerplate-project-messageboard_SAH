const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  board: {type: String, required: true},
  text: {type: String, required: true},
  delete_password:{type: String, required: true},
  reported: {type: Boolean, default: false},
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Reply" 
  }],
  replycount: {type: Number, default: 0},
  created_on: {type: Date, default: new Date()},
  bumped_on: {type: Date, default: new Date()}
  }
);

module.exports = mongoose.model("Thread", ThreadSchema);
