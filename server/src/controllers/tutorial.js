const mongoose = require('mongoose');

const Tourial = require("../models/tutorial");
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

    body('material.*.unit"')
      .notEmpty().withMessage('Unit is required')
      .isString().withMessage("Material unit must be a string"),

    body('material.*.note')
      .optional()
      .isString().withMessage("Material note must be a string")
    ];
}

exports.list = [
    query('title').optional().trim(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const title = req.query.title || '';

        let filters = req.user.is_admin
            ? { title: new RegExp(title, 'i') }
            : { title: new RegExp(title, 'i'), author: req.user.user_id };

        const tutorialPage = await Tutorial
            .find(filters)
            .sort({ difficulty: 'asc' })
            .lean()
            .paginate({ ...req.paginate, populate:{
                path: "categories", 
                select: "name" // Ensure only the 'name' field is populated
            } });
        
        res
            .status(200)
            .links(generatePaginationLinks(
                req.originalUrl,
                req.paginate.page,
                taskPage.totalPages,
                req.paginate.limit
            ))
            .json(taskPage.docs);
    })
];

exports.detail = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id).populate("categories");

    if (task === null) {
        res.status(204).json({ error: "Task not found" });
    }

    if (task.author != req.user.user_id && !req.user.is_admin) {
        res.status(403).json({ error: "You are not allowed to access the task." });
    }

    res.json(task);
});

exports.create = [
    taskValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            status: req.body.status,
            author: req.user.user_id,
            categories: req.body.categories || []
        });

        await task.save();
        res.status(201).json(task);
    })
];

exports.delete = asyncHandler(async (req, res, next) => {

    const task = await Task.findById(req.params.id).exec();

    if (task == null) {
        return res.status(204).json({ error: 'Task not found' });
    }

    if (task.author != req.user.user_id && !req.user.is_admin) {
        return res.status(403).json({ error: "You are not allowed to delete the task." });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200);
});


exports.update = [
    taskValidator(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if the Task exists
        const task = await Task.findOne({ _id: req.params.id });
        if (task == null) {
            return res.status(204).json({ error: 'Task not found' });
        }

        if (task.author != req.user.user_id && !req.user.is_admin) {
            return res.status(403).json({ error: "You are not allowed to modify the task." });
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    dueDate: req.body.dueDate,
                    status: req.body.status,
                    categories: req.body.categories || []
                }
            },
            { new: true, runValidators: true } // `new: true` returns the updated document
        );
        res.status(200).json(updatedTask);
    }),
];