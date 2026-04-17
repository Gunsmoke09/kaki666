const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
};

const registerValidator = [
    body("username")
        .exists({ checkFalsy: true }).withMessage("username is required")
        .bail()
        .trim()
        .isString().withMessage("username must be a string")
        .bail()
        .notEmpty().withMessage("username is required"),
    body("password")
        .exists({ checkFalsy: true }).withMessage("password is required")
        .bail()
        .isString().withMessage("password must be a string")
        .bail()
        .isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
];

const loginValidator = [
    body("username")
        .exists({ checkFalsy: true }).withMessage("username is required")
        .bail()
        .trim()
        .isString().withMessage("username must be a string")
        .bail()
        .notEmpty().withMessage("username is required"),
    body("password")
        .exists({ checkFalsy: true }).withMessage("password is required")
        .bail()
        .isString().withMessage("password must be a string")
        .bail()
        .notEmpty().withMessage("password is required"),
];

exports.register = [
    ...registerValidator,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const normalizedUsername = String(req.body.username).trim();
        const password = String(req.body.password);

        const existingUser = await User.findOne({ username: normalizedUsername });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        const user = new User({ username: normalizedUsername, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    }),
];

exports.login = [
    ...loginValidator,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        ensureJwtSecret();

        const normalizedUsername = String(req.body.username).trim();
        const password = String(req.body.password);
        const user = await User.findOne({ username: normalizedUsername });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ user_id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token });
    }),
];
