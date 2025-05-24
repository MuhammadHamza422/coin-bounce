const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema, 'tokens');
