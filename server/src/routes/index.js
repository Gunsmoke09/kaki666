const express = require("express");

const AuthenticationRouter = require("./auth");
const TutorialRouter = require("./tutorial");
const CategoryRouter = require("./category");

const router = express.Router();

router.use('/auth', AuthenticationRouter);
router.use('/tutorials', TutorialRouter);
router.use('/categories', CategoryRouter);

module.exports = router;