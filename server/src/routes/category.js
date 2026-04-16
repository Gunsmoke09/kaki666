const express = require("express");

const controller = require("../controllers/category");

const validateMongoId = require("../middleware/validateMongoId");
const authenticateWithJwt = require("../middleware/authenticateWithJwt");
const validatePaginateQueryParams = require("../middleware/validatePaginateQueryParams");

const router = express.Router();

router.use(authenticateWithJwt);

router.route("/")
  .get(validatePaginateQueryParams, controller.list)
  .post(controller.create);

router.route("/:id")
  .all(validateMongoId("id"))
  .get(controller.detail)
  .put(controller.update)
  .delete(controller.delete);

module.exports = router;
