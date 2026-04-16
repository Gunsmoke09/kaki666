const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");

const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
};

exports.register = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    const normalizedUsername = String(username).trim();
    if (!normalizedUsername) {
        return res.status(400).json({ error: "username is required" });
    }

    if (String(password).length < 6) {
        return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
    }

    const user = new User({ username: normalizedUsername, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
});

exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    ensureJwtSecret();

    const normalizedUsername = String(username).trim();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ user_id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
});
