const mongoose = require("mongoose");
let ProgrammeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    theme: {
      type: String,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    uploadedDocumentFiles: {
      type: [String],
    },
    uploadedVideoUrl: {
      type: String,
    },
    session_form: {
      type: String,
    },
    cloudinary_id: {
      type: [String],
    },
    status: {
      type: String,
      default: "completed",
      enum: ["pending", "active", "completed"],
    },
  },
  {
    timestamps: true,
  }
);

const Programmes = mongoose.model("Programme", ProgrammeSchema);

module.exports = Programmes;
