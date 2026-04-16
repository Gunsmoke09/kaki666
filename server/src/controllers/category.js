const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const { body, query, validationResult } = require("express-validator");

const categoryValidator = () => [
    body("name")
        .trim()
        .notEmpty().withMessage("name is required")
        .isString().withMessage("name must be a string"),
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

exports.create = [
    categoryValidator(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const category = new Category({
            name: req.body.name,
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
                    name: req.body.name,
                },
            },
            { new: true, runValidators: true },
        );

        return res.status(200).json(updatedCategory);
    }),
];
