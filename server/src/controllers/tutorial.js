const mongoose = require('mongoose');

const Tutorial = require("../models/tutorial");
const asyncHandler = require("express-async-handler");

const { body, query, validationResult } = require("express-validator");
const { generatePaginationLinks } = require("../utils/generatePaginationLinks");

const tutorialValidator = () => {
    return [
        body('title')
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string'),

        body('description')
            .notEmpty().withMessage('Description is required')
            .isString().withMessage('Description must be a string'),

        body('instructions')
            .notEmpty().withMessage('Instructions are required')
            .isString().withMessage('Instructions must be a string'),

        body('AverageTimeSpentMinutes')
            .notEmpty().withMessage('Average Time Spent (per minutes) is required')
            .isInt({ min: 0 }).withMessage('Average time spent must be a positive integer'),

        body('difficulty')
            .notEmpty().withMessage('Difficulty is required')
            .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Difficulty must be either "Beginner", "Intermediate", or "Advanced"'),

        body('categories')
            .optional()
            .isArray().withMessage('Categories must be an array')
            .custom((categories) => {
                return categories.every(id => mongoose.Types.ObjectId.isValid(id));
            }).withMessage('Each category must be a valid MongoDB ObjectId'),

        body('material')
            .notEmpty().withMessage('Material is required')
            .isArray().withMessage('Material must be an array')
            .custom((material) => {
                return material.every(item => mongoose.Types.ObjectId.isValid(item.material));
            }).withMessage('Each material must have a valid material ID'),

        body('material.*.quantity')
            .notEmpty().withMessage('Quantity is required')
            .isInt({ min: 1 }).withMessage("Material quantity must be a positive integer"),

        body('material.*.unit')
            .notEmpty().withMessage('Unit is required')
            .isString().withMessage("Material unit must be a string"),

        body('material.*.note')
            .optional()
            .isString().withMessage("Material note must be a string")
    ];
}

exports.list = [
    query('title').optional().trim(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const title = req.query.title || '';
        const filters = { title: new RegExp(title, 'i') };

        const tutorialPage = await Tutorial.paginate(filters, {
            page: req.paginate.page,
            limit: req.paginate.limit,
            sort: { difficulty: 'asc' },
            lean: true,
            populate: {
                path: "categories",
                select: "name"
            }
        });

        res
            .status(200)
            .links(generatePaginationLinks(
                req.originalUrl,
                req.paginate.page,
                tutorialPage.totalPages,
                req.paginate.limit
            ))
            .json(tutorialPage.docs);
    })
];

exports.detail = asyncHandler(async (req, res, next) => {
    const tutorial = await Tutorial.findById(req.params.id).populate("categories");

    if (tutorial === null) {
        res.status(404).json({ error: "Tutorial not found" });
    }

    res.json(tutorial);
});

exports.create = [
    tutorialValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const tutorial = new Tutorial({
            title: req.body.title,
            description: req.body.description,
            instructions: req.body.instructions,
            AverageTimeSpentMinutes: req.body.AverageTimeSpentMinutes,
            difficulty: req.body.difficulty,
            author: req.user.user_id,
            categories: req.body.categories || [],
            material: req.body.material || []
        });

        await tutorial.save();
        res.status(201).json(tutorial);
    })
];

exports.delete = asyncHandler(async (req, res, next) => {

    const tutorial = await Tutorial.findById(req.params.id).exec();

    if (tutorial == null) {
        return res.status(404).json({ error: 'Tutorial not found' });
    }

    await Tutorial.findByIdAndDelete(req.params.id);
    res.status(200);
});


exports.update = [
    tutorialValidator(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if the Tutorial exists
        const tutorial = await Tutorial.findOne({ _id: req.params.id });
        if (tutorial == null) {
            return res.status(404).json({ error: 'Tutorial not found' });
        }

        const updatedTutorial = await Tutorial.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    instructions: req.body.instructions,
                    AverageTimeSpentMinutes: req.body.AverageTimeSpentMinutes,
                    difficulty: req.body.difficulty,
                    categories: req.body.categories || [],
                    material: req.body.material || []
                }
            },
            { new: true, runValidators: true } // `new: true` returns the updated document
        );
        res.status(200).json(updatedTutorial);
    }),
];