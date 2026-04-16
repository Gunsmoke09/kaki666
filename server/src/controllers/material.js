const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const { body, query, validationResult } = require("express-validator");

const materialValidator = () => [
    body("name")
        .trim()
        .notEmpty().withMessage("name is required")
        .isString().withMessage("name must be a string"),
    body("purchaseSource")
        .optional({ values: "falsy" })
        .trim()
        .isString().withMessage("purchaseSource must be a string"),
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
            $or: [
                { name: new RegExp(search, "i") },
                { purchaseSource: new RegExp(search, "i") },
            ],
        };

        const materialPage = await Material.paginate(filters, {
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
                    materialPage.totalPages,
                    req.paginate.limit,
                ),
            )
            .json(materialPage.docs);
    }),
];

exports.detail = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id).lean().exec();

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
            purchaseSource: req.body.purchaseSource || "",
            owner: req.user.user_id,
        });

        await material.save();
        return res.status(201).json(material);
    }),
];

exports.delete = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id).exec();

    if (material == null) {
        return res.status(404).json({ error: "Material not found" });
    }

    if (String(material.owner) !== req.user.user_id) {
        return res.status(403).json({ error: "Forbidden: you can only delete your own material" });
    }

    await Material.deleteOne({ _id: req.params.id, owner: req.user.user_id });
    return res.status(200).json({ message: "Material deleted successfully" });
});

exports.update = [
    materialValidator(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingMaterial = await Material.findById(req.params.id).exec();

        if (existingMaterial == null) {
            return res.status(404).json({ error: "Material not found" });
        }

        if (String(existingMaterial.owner) !== req.user.user_id) {
            return res.status(403).json({ error: "Forbidden: you can only update your own material" });
        }

        const updatedMaterial = await Material.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.user_id },
            {
                $set: {
                    name: req.body.name,
                    purchaseSource: req.body.purchaseSource || "",
                },
            },
            { new: true, runValidators: true },
        );

        return res.status(200).json(updatedMaterial);
    }),
];
