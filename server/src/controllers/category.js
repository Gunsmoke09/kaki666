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
    query("sortBy").optional().isIn(["name"]).withMessage("sortBy must be name"),
    query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("sortOrder must be asc or desc"),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const search = req.query.search || req.query.name || "";
        const sortBy = req.query.sortBy || "name";
        const sortOrder = req.query.sortOrder || "asc";
        const filters = {
            owner: req.user.user_id,
            name: new RegExp(search, "i"),
        };

        const categoryPage = await Category.paginate(filters, {
            page: req.paginate.page,
            limit: req.paginate.limit,
            sort: { [sortBy]: sortOrder },
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
    const category = await Category.findOne({ _id: req.params.id, owner: req.user.user_id }).lean().exec();

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
    const category = await Category.findOne({ _id: req.params.id, owner: req.user.user_id }).exec();

    if (category == null) {
        return res.status(404).json({ error: "Category not found" });
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

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.user_id },
            {
                $set: {
                    name: req.body.name,
                },
            },
            { new: true, runValidators: true },
        );

        if (updatedCategory == null) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json(updatedCategory);
    }),
];
