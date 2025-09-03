const AbnRecord = require("../models/AbnRecord");
const AbnName = require("../models/AbnName");
const { validationResult } = require("express-validator");

// @desc    Get all ABN records
// @route   GET /api/v1/abn-records
// @access  Public
const getAllAbnRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      entityType,
      state,
      search,
      sortBy = "lastUpdated",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (entityType) {
      filter.entityTypeCode = entityType;
    }

    if (state) {
      filter.state = state;
    }

    if (search) {
      filter.$or = [
        { abn: { $regex: search, $options: "i" } },
        { legalName: { $regex: search, $options: "i" } },
        { organisationName: { $regex: search, $options: "i" } },
        { acn: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const records = await AbnRecord.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AbnRecord.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: records.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ABN record
// @route   GET /api/v1/abn-records/:abn
// @access  Public
const getAbnRecord = async (req, res, next) => {
  try {
    const { abn } = req.params;

    const record = await AbnRecord.findByAbn(abn);

    if (!record) {
      return res.status(404).json({
        status: "error",
        message: "ABN record not found",
      });
    }

    // Get associated names
    const names = await AbnName.findByAbn(abn);

    res.status(200).json({
      status: "success",
      data: {
        record,
        names,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new ABN record
// @route   POST /api/v1/abn-records
// @access  Public
const createAbnRecord = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const record = await AbnRecord.create(req.body);

    res.status(201).json({
      status: "success",
      data: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "ABN already exists",
      });
    }
    next(error);
  }
};

// @desc    Update ABN record
// @route   PUT /api/v1/abn-records/:abn
// @access  Public
const updateAbnRecord = async (req, res, next) => {
  try {
    const { abn } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const record = await AbnRecord.findOneAndUpdate({ abn: abn }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        status: "error",
        message: "ABN record not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ABN record
// @route   DELETE /api/v1/abn-records/:abn
// @access  Public
const deleteAbnRecord = async (req, res, next) => {
  try {
    const { abn } = req.params;

    // Check if record exists
    const record = await AbnRecord.findByAbn(abn);
    if (!record) {
      return res.status(404).json({
        status: "error",
        message: "ABN record not found",
      });
    }

    // Delete associated names first
    await AbnName.deleteMany({ abn: abn });

    // Delete the record
    await AbnRecord.findOneAndDelete({ abn: abn });

    res.status(200).json({
      status: "success",
      message: "ABN record and associated names deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ABN statistics
// @route   GET /api/v1/abn-records/stats/overview
// @access  Public
const getAbnStats = async (req, res, next) => {
  try {
    const stats = await AbnRecord.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          activeRecords: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          cancelledRecords: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
          gstRegistered: {
            $sum: { $cond: [{ $eq: ["$gstStatus", "Registered"] }, 1, 0] },
          },
        },
      },
    ]);

    const entityTypeStats = await AbnRecord.aggregate([
      {
        $group: {
          _id: "$entityTypeCode",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const stateStats = await AbnRecord.aggregate([
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        overview: stats[0] || {
          totalRecords: 0,
          activeRecords: 0,
          cancelledRecords: 0,
          gstRegistered: 0,
        },
        entityTypes: entityTypeStats,
        states: stateStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAbnRecords,
  getAbnRecord,
  createAbnRecord,
  updateAbnRecord,
  deleteAbnRecord,
  getAbnStats,
};
