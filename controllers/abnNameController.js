const AbnName = require("../models/AbnName");
const AbnRecord = require("../models/AbnRecord");
const { validationResult } = require("express-validator");

// @desc    Get all ABN names
// @route   GET /api/v1/abn-names
// @access  Public
const getAllAbnNames = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      abn,
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (abn) {
      filter.abn = abn;
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { abn: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const names = await AbnName.find(filter)
      .populate(
        "abnRecord",
        "abn status legalName organisationName entityTypeCode"
      )
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AbnName.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: names.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: names,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ABN name
// @route   GET /api/v1/abn-names/:id
// @access  Public
const getAbnName = async (req, res, next) => {
  try {
    const { id } = req.params;

    const name = await AbnName.findById(id).populate(
      "abnRecord",
      "abn status legalName organisationName entityTypeCode"
    );

    if (!name) {
      return res.status(404).json({
        status: "error",
        message: "ABN name not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: name,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get names by ABN
// @route   GET /api/v1/abn-names/abn/:abn
// @access  Public
const getNamesByAbn = async (req, res, next) => {
  try {
    const { abn } = req.params;

    const names = await AbnName.findByAbn(abn);

    if (!names || names.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No names found for this ABN",
      });
    }

    res.status(200).json({
      status: "success",
      results: names.length,
      data: names,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new ABN name
// @route   POST /api/v1/abn-names
// @access  Public
const createAbnName = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const name = await AbnName.create(req.body);

    // Populate the created name with ABN record details
    await name.populate(
      "abnRecord",
      "abn status legalName organisationName entityTypeCode"
    );

    res.status(201).json({
      status: "success",
      data: name,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "This name already exists for the given ABN and type",
      });
    }
    next(error);
  }
};

// @desc    Update ABN name
// @route   PUT /api/v1/abn-names/:id
// @access  Public
const updateAbnName = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const name = await AbnName.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate(
      "abnRecord",
      "abn status legalName organisationName entityTypeCode"
    );

    if (!name) {
      return res.status(404).json({
        status: "error",
        message: "ABN name not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: name,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ABN name
// @route   DELETE /api/v1/abn-names/:id
// @access  Public
const deleteAbnName = async (req, res, next) => {
  try {
    const { id } = req.params;

    const name = await AbnName.findByIdAndDelete(id);

    if (!name) {
      return res.status(404).json({
        status: "error",
        message: "ABN name not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "ABN name deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search names
// @route   GET /api/v1/abn-names/search/:term
// @access  Public
const searchNames = async (req, res, next) => {
  try {
    const { term } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const names = await AbnName.find({
      $text: { $search: term },
    })
      .populate(
        "abnRecord",
        "abn status legalName organisationName entityTypeCode"
      )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AbnName.countDocuments({
      $text: { $search: term },
    });

    res.status(200).json({
      status: "success",
      results: names.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: names,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get name statistics
// @route   GET /api/v1/abn-names/stats/overview
// @access  Public
const getNameStats = async (req, res, next) => {
  try {
    const stats = await AbnName.aggregate([
      {
        $group: {
          _id: null,
          totalNames: { $sum: 1 },
          uniqueAbns: { $addToSet: "$abn" },
        },
      },
      {
        $project: {
          totalNames: 1,
          uniqueAbns: { $size: "$uniqueAbns" },
        },
      },
    ]);

    const typeStats = await AbnName.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        overview: stats[0] || {
          totalNames: 0,
          uniqueAbns: 0,
        },
        nameTypes: typeStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAbnNames,
  getAbnName,
  getNamesByAbn,
  createAbnName,
  updateAbnName,
  deleteAbnName,
  searchNames,
  getNameStats,
};
