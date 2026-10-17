const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const controller = require("../controllers/doctorCategory.controller");

// Categories are public to any authenticated user (admin manages, doctors/patients read).
router.use(authenticate);

router.get("/",    controller.listCategories);
router.get("/:id", controller.getCategory);

// Admin-only mutations
router.post("/",        authorize("ADMIN"), controller.createCategory);
router.put("/:id",      authorize("ADMIN"), controller.updateCategory);
router.delete("/:id",   authorize("ADMIN"), controller.deleteCategory);

module.exports = router;