const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const controller = require("../controllers/doctorCategory.controller");

// Categories are public so unauthenticated signup forms can populate dropdowns.
// Admin-only mutations stay protected below.
router.get("/",    controller.listCategories);
router.get("/:id", controller.getCategory);

// Admin-only mutations
router.post("/",        authenticate, authorize("ADMIN"),        controller.createCategory);
router.put("/:id",      authenticate, authorize("ADMIN"),        controller.updateCategory);
router.delete("/:id",   authenticate, authorize("ADMIN"),        controller.deleteCategory);

module.exports = router;