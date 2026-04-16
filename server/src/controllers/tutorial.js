const mongoose = require("mongoose");

const Tutorial = require("../models/tutorial");
const Category = require("../models/category");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");

const { body, query, validationResult } = require("express-validator");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const normalizeMaterialPayload = (material = []) => (
    material.map((item) => ({
        material: item.material || item.materialId,
        quantity: item.quantity,
        unit: item.unit,
        note: item.note,
    }))
);

const tutorialValidator = () => [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string"),

    body("description")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isString().withMessage("Description must be a string"),

    body("instructions")
        .trim()
        .notEmpty().withMessage("Instructions are required")
        .isString().withMessage("Instructions must be a string"),

    body("AverageTimeSpentMinutes")
        .notEmpty().withMessage("Average Time Spent (per minutes) is required")
        .isInt({ min: 0 }).withMessage("Average time spent must be a positive integer"),

    body("difficulty")
        .notEmpty().withMessage("Difficulty is required")
        .isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Difficulty must be either Beginner, Intermediate, or Advanced"),

    body("categories")
        .optional()
        .isArray().withMessage("Categories must be an array")
        .custom((categories) => categories.every((id) => mongoose.Types.ObjectId.isValid(id)))
        .withMessage("Each category must be a valid MongoDB ObjectId"),

    body("material")
        .notEmpty().withMessage("Material is required")
        .isArray().withMessage("Material must be an array")
        .custom((material) => material.every((item) => mongoose.Types.ObjectId.isValid(item.material || item.materialId)))
        .withMessage("Each material must have a valid material ID"),

    body("material.*.quantity")
        .notEmpty().withMessage("Quantity is required")
        .isFloat({ min: 0.01 }).withMessage("Material quantity must be a positive number"),

    body("material.*.unit")
        .trim()
        .notEmpty().withMessage("Unit is required")
        .isString().withMessage("Material unit must be a string"),

    body("material.*.note")
        .optional({ values: "falsy" })
        .isString().withMessage("Material note must be a string"),
];

const difficultyOrder = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
};

const ensureRelatedRecordsBelongToUser = async (userId, categories = [], material = []) => {
    if (categories.length > 0) {
        const categoryCount = await Category.countDocuments({
            _id: { $in: categories },
            owner: userId,
        });

        if (categoryCount !== categories.length) {
            return "One or more categories are invalid for this user";
        }
    }

    const materialIds = material.map((item) => item.material || item.materialId);
    if (materialIds.length > 0) {
        const materialCount = await Material.countDocuments({
            _id: { $in: materialIds },
            owner: userId,
        });

        if (materialCount !== materialIds.length) {
            return "One or more materials are invalid for this user";
        }
    }

    return null;
};

exports.list = [
    query("search").optional().trim(),
    query("sortBy").optional().isIn(["difficulty", "AverageTimeSpentMinutes"]).withMessage("Invalid sortBy"),
    query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("sortOrder must be asc or desc"),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const search = req.query.search || req.query.title || "";
        const sortBy = req.query.sortBy || "difficulty";
        const sortOrder = req.query.sortOrder || "asc";

        const filters = {
            title: new RegExp(search, "i"),
        };

        const sortStage =
            sortBy === "AverageTimeSpentMinutes"
                ? { AverageTimeSpentMinutes: sortOrder === "desc" ? -1 : 1 }
                : { difficultyRank: sortOrder === "desc" ? -1 : 1 };

        const aggregation = [
            { $match: filters },
            {
                $addFields: {
                    difficultyRank: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$difficulty", "Beginner"] }, then: difficultyOrder.Beginner },
                                { case: { $eq: ["$difficulty", "Intermediate"] }, then: difficultyOrder.Intermediate },
                                { case: { $eq: ["$difficulty", "Advanced"] }, then: difficultyOrder.Advanced },
                            ],
                            default: 99,
                        },
                    },
                },
            },
            { $sort: sortStage },
        ];

        const page = req.paginate.page;
        const limit = req.paginate.limit;
        const skip = (page - 1) * limit;

        const results = await Tutorial.aggregate([
            ...aggregation,
            {
                $facet: {
                    docs: [{ $skip: skip }, { $limit: limit }],
                    meta: [{ $count: "totalDocs" }],
                },
            },
        ]);

        const docs = results[0]?.docs || [];
        const totalDocs = results[0]?.meta?.[0]?.totalDocs || 0;
        const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);

        const populatedDocs = await Tutorial.populate(docs, [
            { path: "categories", select: "name" },
            { path: "material.material", select: "name purchaseSource" },
        ]);

        return res
            .status(200)
            .links(
                generatePaginationLinks(
                    req.originalUrl,
                    page,
                    totalPages,
                    limit,
                ),
            )
            .json(populatedDocs);
    }),
];

exports.detail = asyncHandler(async (req, res) => {
    const tutorial = await Tutorial.findById(req.params.id)
        .populate("categories")
        .populate("material.material");

    if (tutorial === null) {
        return res.status(404).json({ error: "Tutorial not found" });
    }

    return res.json(tutorial);
});

exports.create = [
    tutorialValidator(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const relatedError = await ensureRelatedRecordsBelongToUser(
            req.user.user_id,
            req.body.categories || [],
            req.body.material || [],
        );

        if (relatedError) {
            return res.status(400).json({ error: relatedError });
        }

        const tutorial = new Tutorial({
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            AverageTimeSpentMinutes: req.body.AverageTimeSpentMinutes,
            difficulty: req.body.difficulty,
            author: req.user.user_id,
            categories: req.body.categories || [],
            material: normalizeMaterialPayload(req.body.material || []),
        });

        await tutorial.save();
        return res.status(201).json(tutorial);
    }),
];

exports.delete = asyncHandler(async (req, res) => {
    const tutorial = await Tutorial.findById(req.params.id).exec();

    if (tutorial == null) {
        return res.status(404).json({ error: "Tutorial not found" });
    }

    if (String(tutorial.author) !== req.user.user_id) {
        return res.status(403).json({ error: "Forbidden: you can only delete your own tutorial" });
    }

    await Tutorial.deleteOne({ _id: req.params.id, author: req.user.user_id });
    return res.status(200).json({ message: "Tutorial deleted successfully" });
});

exports.update = [
    tutorialValidator(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingTutorial = await Tutorial.findById(req.params.id).exec();

        if (existingTutorial == null) {
            return res.status(404).json({ error: "Tutorial not found" });
        }

        if (String(existingTutorial.author) !== req.user.user_id) {
            return res.status(403).json({ error: "Forbidden: you can only update your own tutorial" });
        }

        const relatedError = await ensureRelatedRecordsBelongToUser(
            req.user.user_id,
            req.body.categories || [],
            req.body.material || [],
        );

        if (relatedError) {
            return res.status(400).json({ error: relatedError });
        }

        const updatedTutorial = await Tutorial.findOneAndUpdate(
            { _id: req.params.id, author: req.user.user_id },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    instructions: req.body.instructions,
                    AverageTimeSpentMinutes: req.body.AverageTimeSpentMinutes,
                    difficulty: req.body.difficulty,
                    categories: req.body.categories || [],
                    material: normalizeMaterialPayload(req.body.material || []),
                },
            },
            { new: true, runValidators: true },
        );

        return res.status(200).json(updatedTutorial);
    }),
];
