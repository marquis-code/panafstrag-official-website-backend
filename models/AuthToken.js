"use strict";

const mongoose = require("mongoose");
let AuthTokenSchema = new mongoose.Schema(
  {
    value: {
      type: String,
    },
    expires: {
      type: Number,
      default: Date().now,
    },
  },
  {
    timestamps: true,
  }
);

const AuthToken = mongoose.model("AuthToken", AuthTokenSchema);

module.exports = AuthToken;
