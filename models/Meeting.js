const mongoose = require("mongoose");
let MeetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Meeting = mongoose.model("Meeting", MeetingSchema);

module.exports = Meeting;
