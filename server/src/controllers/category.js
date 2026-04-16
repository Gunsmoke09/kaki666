const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const { body, query, validationResult } = require("express-validator");

const categoryValidator = () => {
    return [
        body('name')
            .notEmpty().withMessage('name is required')
            .isString().withMessage('name must be a string'),
    ];
};

exports.list = [
    query("name").optional().trim(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const name = req.query.name || "";
        const filters = { name: new RegExp(name, "i") };

        const categoryPage = await Category.paginate(filters, {
            page: req.paginate.page,
            limit: req.paginate.limit,
            sort: { name: "asc" },
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
    const category = await Category.findById(req.params.id).exec();

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
            description: req.body.description,
        });

        await category.save();
        return res.status(201).json(category);
    }),
];

exports.delete = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).exec();

    if (category == null) {
        return res.status(404).json({ error: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Category deleted successfully' });
});

exports.update = [
    categoryValidator(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const category = await Category.findOne({ _id: req.params.id });
        if (category == null) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: req.params.id },
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
