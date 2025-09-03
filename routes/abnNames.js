const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getAllAbnNames,
  getAbnName,
  getNamesByAbn,
  createAbnName,
  updateAbnName,
  deleteAbnName,
  searchNames,
  getNameStats,
} = require("../controllers/abnNameController");

const router = express.Router();

// Validation middleware
const validateAbnName = [
  body("abn")
    .isLength({ min: 11, max: 11 })
    .withMessage("ABN must be exactly 11 digits")
    .isNumeric()
    .withMessage("ABN must contain only numbers"),
  body("name")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Name must be between 1 and 500 characters"),
  body("type")
    .isIn(["TradingName", "BusinessName", "LegalName", "Other"])
    .withMessage(
      "Type must be one of: TradingName, BusinessName, LegalName, Other"
    ),
];

const validateIdParam = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

const validateAbnParam = [
  param("abn")
    .isLength({ min: 11, max: 11 })
    .withMessage("ABN must be exactly 11 digits")
    .isNumeric()
    .withMessage("ABN must contain only numbers"),
];

const validateSearchParam = [
  param("term")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),
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
  query("type")
    .optional()
    .isIn(["TradingName", "BusinessName", "LegalName", "Other"])
    .withMessage("Invalid name type"),
  query("sortBy")
    .optional()
    .isIn(["name", "type", "createdAt", "updatedAt"])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),
];

// Routes
router
  .route("/")
  .get(validateQueryParams, getAllAbnNames)
  .post(validateAbnName, createAbnName);

router.route("/stats/overview").get(getNameStats);

router.route("/search/:term").get(validateSearchParam, searchNames);

router.route("/abn/:abn").get(validateAbnParam, getNamesByAbn);

router
  .route("/:id")
  .get(validateIdParam, getAbnName)
  .put(validateIdParam, validateAbnName, updateAbnName)
  .delete(validateIdParam, deleteAbnName);

module.exports = router;
