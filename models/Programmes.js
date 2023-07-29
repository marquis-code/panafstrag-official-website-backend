const mongoose = require("mongoose");

const nestedProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    meetingType: {
      type: String,
      required: true
    },
    uploadedDocumentFiles: {
      type: [String],
      default: []
    },
    uploadedVideoUrl: {
      type: String,
      default: ''
    },
    zoomMeetingUrl: {
      type: String,
      default: ''
    },
    session_form: {
      type: String,
      default: ''
    },
    meetingType: {
      type: String,
      default: "virtual",
      enum: ["hybrid", "physical", "virtual"],
    },
    cloudinary_id: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      default: "completed",
      enum: ["pending", "active", "completed"],
    },
  },
);


let ProgrammeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    theme: {
      type: String,
    },
    programType: {
      type: String,
      default: "single",
      enum: ["single", "series"],
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
    zoomMeetingUrl: {
      type: String,
    },
    session_form: {
      type: String,
    },
    meetingType: {
      type: String,
      default: "virtual",
      enum: ["hybrid", "physical", "virtual"],
    },
    cloudinary_id: {
      type: [String],
    },
    nestedProgrammes: {
      type: [nestedProgramSchema],
      default: []
    },
    duration: {
      type: String,
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
