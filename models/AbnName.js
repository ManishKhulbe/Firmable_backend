const mongoose = require("mongoose");

const abnNameSchema = new mongoose.Schema(
  {
    abn: {
      type: String,
      required: [true, "ABN is required"],
      length: [11, "ABN must be exactly 11 digits"],
      match: [/^\d{11}$/, "ABN must contain only digits"],
      ref: "AbnRecord",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [500, "Name cannot exceed 500 characters"],
    },
    type: {
      type: String,
      required: [true, "Name type is required"],
      enum: ["TradingName", "BusinessName", "LegalName", "Other"],
      default: "BusinessName",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
// Note: abn index is already created by compound index below
abnNameSchema.index({ type: 1 });
abnNameSchema.index({ name: "text" }); // Text search index

// Compound index for unique constraint
abnNameSchema.index({ abn: 1, name: 1, type: 1 }, { unique: true });

// Virtual to populate ABN record details
abnNameSchema.virtual("abnRecord", {
  ref: "AbnRecord",
  localField: "abn",
  foreignField: "abn",
  justOne: true,
});

// Static method to find by ABN
abnNameSchema.statics.findByAbn = function (abn) {
  return this.find({ abn: abn }).populate("abnRecord");
};

// Static method to find by name type
abnNameSchema.statics.findByType = function (type) {
  return this.find({ type: type }).populate("abnRecord");
};

// Static method to search names
abnNameSchema.statics.searchNames = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
  }).populate("abnRecord");
};

// Pre-save middleware to validate ABN exists
abnNameSchema.pre("save", async function (next) {
  try {
    const AbnRecord = mongoose.model("AbnRecord");
    const abnRecord = await AbnRecord.findOne({ abn: this.abn });

    if (!abnRecord) {
      const error = new Error("ABN does not exist in records");
      error.statusCode = 400;
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("AbnName", abnNameSchema);
