const mongoose = require("mongoose");
const { Schema } = mongoose;

const date = new Date();

const ReplySchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  text: String,
  created_on: { type: Date, default: () => new Date() }, // Use a function to capture the current date
  delete_password: String,
  bumped_on: { type: Date, default: () => new Date() }, // Use a function to capture the current date
  reported: { type: Boolean, default: false },
});

const Reply = mongoose.model("Reply", ReplySchema);

const ThreadSchema = new Schema({
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies: { type: [ReplySchema] },
});

const Thread = mongoose.model("Thread", ThreadSchema);

exports.Thread = Thread;
exports.Reply = Reply;
