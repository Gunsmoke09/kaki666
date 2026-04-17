const mongoose = require("mongoose");
const Category = require("../models/category");
const Tutorial = require("../models/tutorial");
const asyncHandler = require("express-async-handler");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const { body, query, validationResult } = require("express-validator");

const categoryValidator = () => [
    body("name")
        .exists({ checkFalsy: true }).withMessage("name is required")
        .bail()
        .trim()
        .isString().withMessage("name must be a string")
        .bail()
        .notEmpty().withMessage("name is required"),
    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isString().withMessage("description must be a string"),
];

exports.list = [
    query("search").optional().trim(),
    query("sort").optional().isIn(["name_asc", "name_desc"]).withMessage("sort must be name_asc or name_desc"),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const search = req.query.search || req.query.name || "";
        const sort = req.query.sort || "name_asc";
        const sortOrder = sort === "name_desc" ? "desc" : "asc";
        const filters = {
            name: new RegExp(search, "i"),
        };

        const categoryPage = await Category.paginate(filters, {
            page: req.paginate.page,
            limit: req.paginate.limit,
            sort: { name: sortOrder },
            lean: true,
        });

        return res
            .status(200)
            .links(
                generatePaginationLinks(
                    req.originalUrl,
                    req.paginate.page,
                    categoryPage.totalPages,
                    req.paginate.limit,
                ),
            )
            .json(categoryPage.docs);
    }),
];

exports.detail = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).lean().exec();

    if (category === null) {
        return res.status(404).json({ error: "Category not found" });
    }

    return res.json(category);
});

exports.tutorials = [
    query("search").optional().trim(),
    query("sort")
        .optional()
        .isIn(["name_asc", "name_desc", "difficulty_asc", "difficulty_desc", "time_asc", "time_desc"])
        .withMessage("Invalid sort"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const categoryId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: "Invalid MongoDB ObjectID" });
        }

        const category = await Category.findById(categoryId).select("_id").lean().exec();
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        const search = req.query.search || "";
        const sort = req.query.sort || "difficulty_asc";

        const filters = {
            title: new RegExp(search, "i"),
            categories: new mongoose.Types.ObjectId(categoryId),
        };

        let sortStage = { title: 1 };
        if (sort === "name_desc") sortStage = { title: -1 };
        if (sort === "difficulty_asc") sortStage = { difficulty: 1, title: 1 };
        if (sort === "difficulty_desc") sortStage = { difficulty: -1, title: 1 };
        if (sort === "time_asc") sortStage = { AverageTimeSpentMinutes: 1 };
        if (sort === "time_desc") sortStage = { AverageTimeSpentMinutes: -1 };

        const tutorialPage = await Tutorial.paginate(filters, {
            page: req.paginate.page,
            limit: req.paginate.limit,
            sort: sortStage,
            populate: [
                { path: "categories", select: "name" },
                { path: "material.material", select: "name purchaseSource" },
            ],
            lean: true,
        });

        return res
            .status(200)
            .links(
                generatePaginationLinks(
                    req.originalUrl,
                    req.paginate.page,
                    tutorialPage.totalPages,
                    req.paginate.limit,
                ),
            )
            .json(tutorialPage.docs);
    }),
];

exports.create = [
    categoryValidator(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const category = new Category({
            name: req.body.name.trim(),
            description: req.body.description?.trim() || "",
            owner: req.user.user_id,
        });

        await category.save();
        return res.status(201).json(category);
    }),
];

exports.delete = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).exec();

    if (category == null) {
        return res.status(404).json({ error: "Category not found" });
    }

    if (String(category.owner) !== req.user.user_id) {
        return res.status(403).json({ error: "Forbidden: you can only delete your own category" });
    }

    await Category.deleteOne({ _id: req.params.id, owner: req.user.user_id });
    return res.status(200).json({ message: "Category deleted successfully" });
});

exports.update = [
    categoryValidator(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingCategory = await Category.findById(req.params.id).exec();

        if (existingCategory == null) {
            return res.status(404).json({ error: "Category not found" });
        }

        if (String(existingCategory.owner) !== req.user.user_id) {
            return res.status(403).json({ error: "Forbidden: you can only update your own category" });
        }

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.user_id },
            {
                $set: {
                    name: req.body.name.trim(),
                    description: req.body.description?.trim() || "",
                },
            },
            { new: true, runValidators: true },
        );

        return res.status(200).json(updatedCategory);
    }),
];
