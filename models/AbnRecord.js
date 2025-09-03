const mongoose = require("mongoose");

const abnRecordSchema = new mongoose.Schema(
  {
    abn: {
      type: String,
      required: [true, "ABN is required"],
      unique: true,
      length: [11, "ABN must be exactly 11 digits"],
      match: [/^\d{11}$/, "ABN must contain only digits"],
    },
    status: {
      type: String,
      enum: ["Active", "Cancelled"],
      default: "Active",
    },
    abnStatusFromDate: {
      type: Date,
      default: Date.now,
    },
    entityTypeCode: {
      type: String,
      maxlength: [10, "Entity type code cannot exceed 10 characters"],
    },
    entityTypeText: {
      type: String,
      maxlength: [100, "Entity type text cannot exceed 100 characters"],
    },
    legalName: {
      type: String,
      required: function () {
        return !this.organisationName;
      },
    },
    organisationName: {
      type: String,
      required: function () {
        return !this.legalName;
      },
    },
    acn: {
      type: String,
      length: [9, "ACN must be exactly 9 digits"],
      match: [/^\d{9}$/, "ACN must contain only digits"],
      validate: {
        validator: function (v) {
          return !v || /^\d{9}$/.test(v);
        },
        message: "ACN must be exactly 9 digits",
      },
    },
    gstStatus: {
      type: String,
      enum: ["Registered", "Cancelled"],
      default: "Cancelled",
    },
    gstFromDate: {
      type: Date,
    },
    state: {
      type: String,
      maxlength: [10, "State cannot exceed 10 characters"],
    },
    postcode: {
      type: String,
      maxlength: [10, "Postcode cannot exceed 10 characters"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
// Note: abn index is already created by unique: true in schema
abnRecordSchema.index({ status: 1 });
abnRecordSchema.index({ entityTypeCode: 1 });
abnRecordSchema.index({ state: 1 });
abnRecordSchema.index({ lastUpdated: -1 });

// Virtual for full entity name
abnRecordSchema.virtual("fullEntityName").get(function () {
  return this.organisationName || this.legalName;
});

// Pre-save middleware to update lastUpdated
abnRecordSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find by ABN
abnRecordSchema.statics.findByAbn = function (abn) {
  return this.findOne({ abn: abn });
};

// Static method to find active records
abnRecordSchema.statics.findActive = function () {
  return this.find({ status: "Active" });
};

module.exports = mongoose.model("AbnRecord", abnRecordSchema);
