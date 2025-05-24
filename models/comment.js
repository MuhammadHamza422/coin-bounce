const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    blog: { type: mongoose.SchemaTypes.ObjectId, ref: "Blog" },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema, "comments");
