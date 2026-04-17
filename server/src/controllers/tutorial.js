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
        .exists({ checkFalsy: true }).withMessage("Title is required")
        .bail()
        .trim()
        .isString().withMessage("Title must be a string")
        .bail()
        .notEmpty().withMessage("Title is required"),

    body("description")
        .exists({ checkFalsy: true }).withMessage("Description is required")
        .bail()
        .trim()
        .isString().withMessage("Description must be a string")
        .bail()
        .notEmpty().withMessage("Description is required"),

    body("instructions")
        .exists({ checkFalsy: true }).withMessage("Instructions are required")
        .bail()
        .trim()
        .isString().withMessage("Instructions must be a string")
        .bail()
        .notEmpty().withMessage("Instructions are required"),

    body("AverageTimeSpentMinutes")
        .exists({ checkFalsy: true }).withMessage("Average Time Spent (per minutes) is required")
        .bail()
        .isFloat({ min: 0 }).withMessage("Average time spent must be a valid non-negative number")
        .toFloat(),

    body("difficulty")
        .exists({ checkFalsy: true }).withMessage("Difficulty is required")
        .bail()
        .isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Difficulty must be either Beginner, Intermediate, or Advanced"),

    body("categories")
        .optional()
        .isArray().withMessage("Categories must be an array")
        .custom((categories) => categories.every((id) => mongoose.Types.ObjectId.isValid(id)))
        .withMessage("Each category must be a valid MongoDB ObjectId"),

    body("material")
        .exists({ checkFalsy: true }).withMessage("Material is required")
        .bail()
        .isArray({ min: 1 }).withMessage("Material must be a non-empty array")
        .custom((material) => material.every((item) => mongoose.Types.ObjectId.isValid(item.material || item.materialId)))
        .withMessage("Each material must have a valid material ID"),

    body("material.*.quantity")
        .optional({ values: "falsy" })
        .isFloat({ min: 0.01 }).withMessage("Material quantity must be a positive number"),

    body("material.*.unit")
        .optional({ values: "falsy" })
        .trim()
        .isString().withMessage("Material unit must be a string"),

    body("material.*.note")
        .optional({ values: "falsy" })
        .trim()
        .isString().withMessage("Material note must be a string"),
];

const difficultyOrder = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
};

const ensureRelatedRecordsExist = async (categories = [], material = []) => {
    if (categories.length > 0) {
        const categoryCount = await Category.countDocuments({
            _id: { $in: categories },
        });

        if (categoryCount !== categories.length) {
            return "One or more categories are invalid";
        }
    }

    const materialIds = material.map((item) => item.material || item.materialId);
    if (materialIds.length > 0) {
        const materialCount = await Material.countDocuments({
            _id: { $in: materialIds },
        });

        if (materialCount !== materialIds.length) {
            return "One or more materials are invalid";
        }
    }

    return null;
};

exports.list = [
    query("search").optional().trim(),
    query("categoryId").optional().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("categoryId must be a valid MongoDB ObjectId"),
    query("sort")
        .optional()
        .isIn(["name_asc", "name_desc", "difficulty_asc", "difficulty_desc", "time_asc", "time_desc"])
        .withMessage("Invalid sort"),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const search = req.query.search || req.query.title || "";
        const sort = req.query.sort || "difficulty_asc";

        const filters = {
            title: new RegExp(search, "i"),
        };

        if (req.query.categoryId) {
            filters.categories = new mongoose.Types.ObjectId(req.query.categoryId);
        }

        let sortStage = { difficultyRank: 1 };
        if (sort === "name_asc") sortStage = { title: 1 };
        if (sort === "name_desc") sortStage = { title: -1 };
        if (sort === "difficulty_desc") sortStage = { difficultyRank: -1 };
        if (sort === "time_asc") sortStage = { AverageTimeSpentMinutes: 1 };
        if (sort === "time_desc") sortStage = { AverageTimeSpentMinutes: -1 };

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

        const relatedError = await ensureRelatedRecordsExist(
            req.body.categories || [],
            req.body.material || [],
        );

        if (relatedError) {
            return res.status(400).json({ error: relatedError });
        }

        const tutorial = new Tutorial({
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            instructions: req.body.instructions.trim(),
            AverageTimeSpentMinutes: Number(req.body.AverageTimeSpentMinutes),
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

        const relatedError = await ensureRelatedRecordsExist(
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
                    title: req.body.title.trim(),
                    description: req.body.description.trim(),
                    instructions: req.body.instructions.trim(),
                    AverageTimeSpentMinutes: Number(req.body.AverageTimeSpentMinutes),
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
