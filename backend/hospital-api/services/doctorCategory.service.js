const doctorCategoryModel = require("../models/doctorCategory.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const ApiError = require("../utils/error.util");

const listCategories = async () => {
    return doctorCategoryModel.findAll();
};

const getCategory = async (id) => {
    const category = await doctorCategoryModel.findById(id);
    if (!category) throw new ApiError(404, "Category not found");
    return category;
};

const createCategory = async ({ category_name, description }) => {
    if (!category_name || category_name.trim() === "") {
        throw new ApiError(400, "category_name is required");
    }

    const existing = await doctorCategoryModel.findByName(category_name);
    if (existing) throw new ApiError(409, "Category already exists");

    const id = await doctorCategoryModel.create({ category_name, description });
    return doctorCategoryModel.findById(id);
};

const updateCategory = async (id, { category_name, description }) => {
    const existing = await doctorCategoryModel.findById(id);
    if (!existing) throw new ApiError(404, "Category not found");

    if (category_name && category_name !== existing.category_name) {
        const dup = await doctorCategoryModel.findByName(category_name);
        if (dup) throw new ApiError(409, "Category name already in use");
    }

    const ok = await doctorCategoryModel.update(id, { category_name, description });
    if (!ok) throw new ApiError(400, "Update failed");

    return doctorCategoryModel.findById(id);
};

const deleteCategory = async (id) => {
    // Make sure no doctor is using this category before delete.
    const existing = await doctorCategoryModel.findById(id);
    if (!existing) throw new ApiError(404, "Category not found");

    const ok = await doctorCategoryModel.remove(id);
    if (!ok) throw new ApiError(400, "Delete failed");

    return { id };
};

const listDoctors = async (filters) => {
    return doctorProfileModel.findAll(filters);
};

module.exports = {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    listDoctors
};