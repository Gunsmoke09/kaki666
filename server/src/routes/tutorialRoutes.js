const express = require("express");

const controller = require("../controllers/tutorial");

const validateMongoId = require("../middleware/validateMongoId");
const authenicateWithJwt = require("../middleware/authenticateWithJwt");
const validatePaginateQueryParams = require("../middleware/validatePaginateQueryParams");

const router = express.Router();

// List all, and create tutorials are protected routes
router.route("/") //     
    .all(authenicateWithJwt)
    .get(validatePaginateQueryParams, controller.list)
    .post(controller.create);

// Get particular tutorial is unprotected
router.route("/:id")
    .all(authenicateWithJwt)
    .all(validateMongoId('id'))
    .get(controller.detail);

// Update and delete tutorial is protected
router.route("/:id")
    .all(authenicateWithJwt)
    .all(validateMongoId('id'))
    .put(controller.update)
    .delete(controller.delete);

module.exports = router;
