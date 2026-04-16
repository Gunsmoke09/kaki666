const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const { body, query, validationResult } = require("express-validator");

const materialValidator = () => {
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

        const materialPage = await Material.paginate(filters, {
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
                    materialPage.totalPages,
                    req.paginate.limit,
                ),
            )
            .json(materialPage.docs);
    }),
];

exports.detail = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id).exec();

    if (material === null) {
        return res.status(404).json({ error: "Material not found" });
    }

    return res.json(material);
});

exports.create = [
    materialValidator(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const material = new Material({
            name: req.body.name,
        });

        await material.save();
        return res.status(201).json(material);
    }),
];

exports.delete = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id).exec();

    if (material == null) {
        return res.status(404).json({ error: 'Material not found' });
    }

    await Material.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Material deleted successfully' });
});

exports.update = [
    materialValidator(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const material = await Material.findOne({ _id: req.params.id });
        if (material == null) {
            return res.status(404).json({ error: 'Material not found' });
        }

        const updatedMaterial = await Material.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    name: req.body.name,
                },
            },
            { new: true, runValidators: true },
        );

        return res.status(200).json(updatedMaterial);
    }),
];
