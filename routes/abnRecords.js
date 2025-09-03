const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getAllAbnRecords,
  getAbnRecord,
  createAbnRecord,
  updateAbnRecord,
  deleteAbnRecord,
  getAbnStats,
} = require("../controllers/abnRecordController");

const router = express.Router();

// Validation middleware
const validateAbn = [
  body("abn")
    .isLength({ min: 11, max: 11 })
    .withMessage("ABN must be exactly 11 digits")
    .isNumeric()
    .withMessage("ABN must contain only numbers"),
  body("status")
    .optional()
    .isIn(["Active", "Cancelled"])
    .withMessage("Status must be either Active or Cancelled"),
  body("entityTypeCode")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Entity type code cannot exceed 10 characters"),
  body("entityTypeText")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Entity type text cannot exceed 100 characters"),
  body("acn")
    .optional()
    .isLength({ min: 9, max: 9 })
    .withMessage("ACN must be exactly 9 digits")
    .isNumeric()
    .withMessage("ACN must contain only numbers"),
  body("gstStatus")
    .optional()
    .isIn(["Registered", "Cancelled"])
    .withMessage("GST status must be either Registered or Cancelled"),
  body("state")
    .optional()
    .isLength({ max: 10 })
    .withMessage("State cannot exceed 10 characters"),
  body("postcode")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Postcode cannot exceed 10 characters"),
];

const validateAbnParam = [
  param("abn")
    .isLength({ min: 11, max: 11 })
    .withMessage("ABN must be exactly 11 digits")
    .isNumeric()
    .withMessage("ABN must contain only numbers"),
];

const validateQueryParams = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["Active", "Cancelled"])
    .withMessage("Status must be either Active or Cancelled"),
  query("sortBy")
    .optional()
    .isIn([
      "abn",
      "status",
      "lastUpdated",
      "createdAt",
      "legalName",
      "organisationName",
    ])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),
];

// Routes
router
  .route("/")
  .get(validateQueryParams, getAllAbnRecords)
  .post(validateAbn, createAbnRecord);

router.route("/stats/overview").get(getAbnStats);

router
  .route("/:abn")
  .get(validateAbnParam, getAbnRecord)
  .put(validateAbnParam, validateAbn, updateAbnRecord)
  .delete(validateAbnParam, deleteAbnRecord);

module.exports = router;
