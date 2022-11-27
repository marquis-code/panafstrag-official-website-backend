const mongoose = require("mongoose");
let ProgrammeSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    theme: {
      type: String
    },
    startToEndDate: {
      type: String
    },
    uploadedDocumentFiles: {
      type: [String]
    },
    uploadedVideoUrl: { 
      type: String, 
  }
  },
  {
    timestamps: true,
  }
);

const Programmes = mongoose.model("Programme", ProgrammeSchema);

module.exports = Programmes;
