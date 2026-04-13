const express = require("express");

const controller = require("../controllers/category");

const validateMongoId = require("../middleware/validateMongoId");
const authenicateWithJwt = require("../middleware/authenticateWithJwt");

const router = express.Router();

router.route("/") //     
    .all(authenicateWithJwt)
    .get(controller.list)
    .post(controller.create);

router.route("/:id")
    .all(authenicateWithJwt)
    .all(validateMongoId('id'))
    .get(controller.detail)
    .put(controller.update)
    .delete(controller.delete);

module.exports = router;
