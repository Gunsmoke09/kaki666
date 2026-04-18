const Material = require("../models/material");
const Tutorial = require("../models/tutorial");
const asyncHandler = require("express-async-handler");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const { body, query, validationResult } = require("express-validator");

const materialValidator = () => [
    body("name")
        .exists({ checkFalsy: true }).withMessage("name is required")
        .bail()
        .trim()
        .isString().withMessage("name must be a string")
        .bail()
        .notEmpty().withMessage("name is required"),
    body("purchaseSource")
        .optional({ values: "falsy" })
        .trim()
        .isString().withMessage("purchaseSource must be a string"),
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

        const materialPage = await Material.paginate(filters, {
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

        const normalizedName = req.body.name.trim().toLowerCase();
        const existingMaterial = await Material.findOne({
            name: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        })
            .select("_id")
            .lean()
            .exec();

        if (existingMaterial) {
            return res.status(409).json({
                error: "Material name already exists. Please use a different name.",
            });
        }

        const material = new Material({
            name: req.body.name.trim(),
            purchaseSource: req.body.purchaseSource?.trim() || "",
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

    const tutorialUsingMaterial = await Tutorial.exists({ "material.material": req.params.id });
    if (tutorialUsingMaterial) {
        return res.status(400).json({
            error: "Cannot delete material because it is used by one or more tutorials.",
        });
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

        const normalizedName = req.body.name.trim().toLowerCase();
        const duplicateMaterial = await Material.findOne({
            _id: { $ne: req.params.id },
            name: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        })
            .select("_id")
            .lean()
            .exec();

        if (duplicateMaterial) {
            return res.status(409).json({
                error: "Material name already exists. Please use a different name.",
            });
        }

        const updatedMaterial = await Material.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.user_id },
            {
                $set: {
                    name: req.body.name.trim(),
                    purchaseSource: req.body.purchaseSource?.trim() || "",
                },
            },
            { new: true, runValidators: true },
        );

        return res.status(200).json(updatedMaterial);
    }),
];
