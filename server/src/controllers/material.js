const Material = require("../models/material");
const asyncHandler = require("express-async-handler");

const { body, query, validationResult } = require("express-validator");

const materialValidator = () => {
    return [
        body('name')
            .notEmpty().withMessage('name is required')
            .isString().withMessage('name must be a string'),
    ];
}

exports.list = [
    query('name').optional().trim(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const name = req.query.name || '';

        const cats = await Material
            .find({ name: new RegExp(name, 'i') })
            .sort({ name: 'asc' });

        res.status(200).json(cats);
    })
];

exports.detail = asyncHandler(async (req, res, next) => {
    const material = await Material.findById(req.params.id).exec();

    if (material === null) {
        res.status(204).json({ error: "Material not found" });
    }

    res.json(material);
});

exports.create = [
    materialValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const material = new Material({
            name: req.body.name,
        });

        await material.save();
        res.status(201).json(material);
    })
];

exports.delete = asyncHandler(async (req, res, next) => {

    const material = await Material.findById(req.params.id).exec();

    if (material == null) {
        return res.status(204).json({ error: 'Material not found' });
    }

    await Material.findByIdAndDelete(req.params.id);
    res.status(200);
});


exports.update = [
    materialValidator(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if the Material exists
        const material = await Material.findOne({ _id: req.params.id });
        if (material == null) {
            return res.status(204).json({ error: 'Material not found' });
        }

        const updatedMaterial = await Material.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    name: req.body.name,
                }
            },
            { new: true, runValidators: true } // `new: true` returns the updated document
        );
        
        res.status(200).json(updatedMaterial);
    }),
];