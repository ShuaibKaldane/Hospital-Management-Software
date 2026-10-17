const categoryService = require("../services/doctorCategory.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const listCategories = wrap(async (req, res) => {
    const data = await categoryService.listCategories();
    return success(res, 200, "Categories fetched", data);
});

const getCategory = wrap(async (req, res) => {
    const data = await categoryService.getCategory(Number(req.params.id));
    return success(res, 200, "Category fetched", data);
});

const createCategory = wrap(async (req, res) => {
    const data = await categoryService.createCategory(req.body);
    return success(res, 201, "Category created", data);
});

const updateCategory = wrap(async (req, res) => {
    const data = await categoryService.updateCategory(Number(req.params.id), req.body);
    return success(res, 200, "Category updated", data);
});

const deleteCategory = wrap(async (req, res) => {
    const data = await categoryService.deleteCategory(Number(req.params.id));
    return success(res, 200, "Category deleted", data);
});

const listDoctorsForAdmin = wrap(async (req, res) => {
    const filters = {
        status: req.query.status,
        category_id: req.query.category_id,
        search: req.query.search,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
    };
    const data = await categoryService.listDoctors(filters);
    return success(res, 200, "Doctors fetched", data);
});

module.exports = {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    listDoctorsForAdmin
};