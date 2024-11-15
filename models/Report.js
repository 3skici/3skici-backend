const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const REPORT_TYPES = ['Fake Product', 'Harmful Product', 'Illegal Product', 'Other'];
const REPORT_STATUSES = ['Pending', 'Reviewed', 'Resolved'];
const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      default: () => `REP-${uuidv4()}`,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: REPORT_TYPES,
      required: true,
    },
    otherReason: {
      type: String,
      validate: {
        validator: function () {
          return this.reportType === "Other"
            ? this.otherReason && this.otherReason.trim().length > 0
            : true;
        },
        message: 'Other reason must be provided if report type is "Other".',
      },
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "Pending",
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "Low",
    },
    adminAction: {
      comment: { type: String },
      reply: { type: String}
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema, 'reports');
