import { useState, useEffect, useRef, useCallback } from "react";
import { FaTags, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLayerGroup, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { getAllSubCategoriesForAdmin, addSubCategory, updateSubCategory } from "../../services/subCategoryService";

function CategoriesTab({
  categories,
  allCategories,
  categoryForm,
  setCategoryForm,
  editCategoryForm,
  setEditCategoryForm,
  selectedCategory,
  categoryCardRef,
  handleAddCategory,
  handleEditCategory,
  handleUpdateCategory,
  handleToggleCategoryActivation,
  loading,
  page,
  setPage,
  totalPages
}) {
  // State for nested tabs
  const [activeTab, setActiveTab] = useState("categories");

  // Category form visibility
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // SubCategory state
  const [subCategories, setSubCategories] = useState([]);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    description: "",
    categoryId: ""
  });
  const [editSubCategoryForm, setEditSubCategoryForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    isActive: true
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState({ current: null });
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [subCategoryPage, setSubCategoryPage] = useState(1);
  const [subCategoryTotalPages, setSubCategoryTotalPages] = useState(1);

  // Filter and search state
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const subCategoryCardRef = useRef(null);
  const shownToasts = useRef(new Set());

  // Fetch subcategories with server-side filtering
  const fetchSubCategories = useCallback(async () => {
    setSubCategoryLoading(true);
    try {
      const params = {
        page: subCategoryPage,
        limit: 1000 // Increased limit to show all subcategories
      };

      // Add categoryId filter if selected
      if (filterCategory) {
        params.categoryId = filterCategory;
      }

      // Add search query if provided
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await getAllSubCategoriesForAdmin(params);
      setSubCategories(response.data.subCategories || []);
      setSubCategoryTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      const errorMsg = "Failed to load subcategories: " + (err.response?.data?.message || err.message);
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
    } finally {
      setSubCategoryLoading(false);
    }
  }, [subCategoryPage, filterCategory, searchQuery]);

  useEffect(() => {
    if (activeTab === "subcategories") {
      fetchSubCategories();
    }
  }, [activeTab, fetchSubCategories]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (subCategoryPage !== 1) {
      setSubCategoryPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, searchQuery]);

  // Handle add subcategory
  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!subCategoryForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setSubCategoryLoading(true);
    try {
      await addSubCategory(subCategoryForm);
      toast.success("SubCategory added successfully");
      setSubCategoryForm({ name: "", description: "", categoryId: "" });
      setShowSubCategoryForm(false);
      fetchSubCategories();
    } catch (err) {
      const errorMsg = "Failed to add subcategory: " + (err.response?.data?.message || err.message);
      toast.error(errorMsg);
    } finally {
      setSubCategoryLoading(false);
    }
  };  // Handle edit subcategory
  const handleEditSubCategory = (subCategory) => {
    setEditSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description || "",
      categoryId: subCategory.category?._id || subCategory.category,
      isActive: subCategory.isActive
    });
    setSelectedSubCategory({ current: subCategory });
  };

  // Handle update subcategory
  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    setSubCategoryLoading(true);
    try {
      // Only send fields that have actual values
      const updateData = {};

      if (editSubCategoryForm.name && editSubCategoryForm.name.trim()) {
        updateData.name = editSubCategoryForm.name.trim();
      }

      if (editSubCategoryForm.description !== undefined && editSubCategoryForm.description !== null) {
        updateData.description = editSubCategoryForm.description;
      }

      if (editSubCategoryForm.isActive !== undefined) {
        updateData.isActive = editSubCategoryForm.isActive;
      }

      await updateSubCategory(selectedSubCategory.current._id, updateData);
      toast.success("SubCategory updated successfully");
      setSelectedSubCategory({ current: null });
      fetchSubCategories();
    } catch (err) {
      const errorMsg = "Failed to update subcategory: " + (err.response?.data?.message || err.message);
      toast.error(errorMsg);
    } finally {
      setSubCategoryLoading(false);
    }
  };

  const handleToggleSubCategoryActivation = async (subCategoryId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this subcategory?`)) {
      setSubCategoryLoading(true);
      try {
        await updateSubCategory(subCategoryId, { isActive: !currentStatus });
        toast.success(`SubCategory ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchSubCategories();
      } catch (err) {
        const errorMsg = `Failed to ${currentStatus ? 'deactivate' : 'activate'} subcategory: ` + (err.response?.data?.message || err.message);
        toast.error(errorMsg);
      } finally {
        setSubCategoryLoading(false);
      }
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subCategoryCardRef.current && !subCategoryCardRef.current.contains(event.target)) {
        setSelectedSubCategory({ current: null });
      }
    };

    if (selectedSubCategory.current) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubCategory.current]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-md">
            <FaTags className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Category Management
            </h2>
            <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              Manage categories and subcategories
            </p>
          </div>
        </div>
      </div>

      {/* Nested Tabs */}
      <div className="p-2 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${activeTab === "categories" ? "shadow-md" : "hover:opacity-80"
              }`}
            style={{
              background: activeTab === "categories"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: activeTab === "categories" ? "white" : "var(--color-text)"
            }}
          >
            <FaTags />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${activeTab === "subcategories" ? "shadow-md" : "hover:opacity-80"
              }`}
            style={{
              background: activeTab === "subcategories"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: activeTab === "subcategories" ? "white" : "var(--color-text)"
            }}
          >
            <FaLayerGroup />
            <span>SubCategories</span>
          </button>
        </div>
      </div>

      {/* Categories Tab Content */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Header with Add Button */}
          <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <FaTags className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                    Categories
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                    {allCategories.length} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {showCategoryForm ? <FaTimes /> : <FaPlus />}
                <span>{showCategoryForm ? "Cancel" : "Add Category"}</span>
              </button>
            </div>
          </div>

          {/* Add New Category Form (Conditional) */}
          {showCategoryForm && (
            <div className="p-6 rounded-2xl shadow-lg animate-fade-in" style={{ background: 'var(--color-secondary)' }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <FaPlus className="text-pink-500" />
                Add New Category
              </h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label
                    htmlFor="category-name"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                    style={{
                      border: '1px solid var(--color-secondary)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="category-description"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Description
                  </label>
                  <textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                    style={{
                      border: '1px solid var(--color-secondary)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Category"}
                </button>
              </form>
            </div>
          )}

          {/* Available Categories Card */}
          <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Available Categories
            </h3>
            {categories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="group p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
                    >
                      {/* Category Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                            <FaTags className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                              {category.name}
                            </h4>
                          </div>
                        </div>

                        {category.isActive ? (
                          <FaCheckCircle className="text-2xl text-green-500" />
                        ) : (
                          <FaTimesCircle className="text-2xl text-red-500" />
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm opacity-80 mb-4 min-h-[60px]" style={{ color: 'var(--color-text)' }}>
                        {category.description || "No description provided"}
                      </p>

                      {/* Status & Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-block px-4 py-2 rounded-xl text-xs font-semibold shadow-sm ${category.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                          style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleCategoryActivation(category._id, category.isActive)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                          style={{
                            background: category.isActive ? 'var(--color-accent)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'var(--color-bg)'
                          }}
                        >
                          {category.isActive ? <FaTrash /> : <FaCheckCircle />}
                          <span>{category.isActive ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={() =>
                      setPage((prev) => ({
                        ...prev,
                        categories: Math.max(prev.categories - 1, 1),
                      }))
                    }
                    disabled={page.categories === 1}
                    className="px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium px-4 py-2 rounded-xl" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                    Page {page.categories} of {totalPages.categories}
                  </span>
                  <button
                    onClick={() =>
                      setPage((prev) => ({
                        ...prev,
                        categories: Math.min(
                          prev.categories + 1,
                          totalPages.categories
                        ),
                      }))
                    }
                    disabled={page.categories === totalPages.categories}
                    className="px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 rounded-2xl shadow-lg text-center" style={{ background: 'var(--color-secondary)' }}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <FaTags className="text-4xl opacity-50" style={{ color: 'var(--color-text)' }} />
                </div>
                <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                  No categories available.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubCategories Tab Content */}
      {activeTab === "subcategories" && (
        <div className="space-y-6">
          {/* Header with Add Button */}
          <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <FaLayerGroup className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                    SubCategories
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                    {subCategories.length} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubCategoryForm(!showSubCategoryForm)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {showSubCategoryForm ? <FaTimes /> : <FaPlus />}
                <span>{showSubCategoryForm ? "Cancel" : "Add SubCategory"}</span>
              </button>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  <FaFilter className="inline mr-2" />
                  Filter by Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                >
                  <option value="">All Categories</option>
                  {allCategories
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  <FaSearch className="inline mr-2" />
                  Search SubCategories
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or description..."
                    className="w-full border rounded-lg p-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                    style={{
                      border: '1px solid var(--color-secondary)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add New SubCategory Form (Conditional) */}
          {showSubCategoryForm && (
            <div className="p-6 rounded-2xl shadow-lg animate-fade-in" style={{ background: 'var(--color-secondary)' }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <FaPlus className="text-purple-500" />
                Add New SubCategory
              </h3>
              <form onSubmit={handleAddSubCategory} className="space-y-4">
                <div>
                  <label
                    htmlFor="parent-category"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Parent Category
                  </label>
                  <select
                    id="parent-category"
                    value={subCategoryForm.categoryId}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        categoryId: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                    style={{
                      border: '1px solid var(--color-secondary)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    {allCategories
                      .filter((cat) => cat.isActive)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="subcategory-name"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Name
                  </label>
                  <input
                    id="subcategory-name"
                    type="text"
                    value={subCategoryForm.name}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                    style={{
                      border: '1px solid var(--color-secondary)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="subcategory-description"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Description
                  </label>
                  <textarea
                    id="subcategory-description"
                    value={subCategoryForm.description}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                    style={{
                      border: '1px solid var(--color-secondary)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                  disabled={subCategoryLoading}
                >
                  {subCategoryLoading ? "Adding..." : "Add SubCategory"}
                </button>
              </form>
            </div>
          )}

          {/* Available SubCategories Card */}
          <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FaLayerGroup className="text-purple-500" />
              Available SubCategories
              <span className="ml-auto px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                {subCategories.length}
              </span>
            </h3>
            {subCategories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subCategories.map((subCategory) => (
                    <div
                      key={subCategory._id}
                      className="group p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ background: 'var(--color-secondary)', color: 'var(--color-text)', border: '1px solid var(--color-bg)' }}
                    >
                      {/* SubCategory Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                            <FaLayerGroup className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                              {subCategory.name}
                            </h4>
                            <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                              <FaTags className="inline mr-1" />
                              {subCategory.category?.name || "N/A"}
                            </p>
                          </div>
                        </div>

                        {subCategory.isActive ? (
                          <FaCheckCircle className="text-2xl text-green-500" />
                        ) : (
                          <FaTimesCircle className="text-2xl text-red-500" />
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm opacity-80 mb-4 min-h-[60px]" style={{ color: 'var(--color-text)' }}>
                        {subCategory.description || "No description provided"}
                      </p>

                      {/* Status & Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-block px-4 py-2 rounded-xl text-xs font-semibold shadow-sm ${subCategory.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                          {subCategory.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                          {new Date(subCategory.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditSubCategory(subCategory)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white"
                          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleSubCategoryActivation(subCategory._id, subCategory.isActive)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                          style={{
                            background: subCategory.isActive ? 'var(--color-accent)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'var(--color-bg)'
                          }}
                        >
                          {subCategory.isActive ? <FaTrash /> : <FaCheckCircle />}
                          <span>{subCategory.isActive ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination - Only show if there are multiple pages */}
                {subCategoryTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setSubCategoryPage((prev) => Math.max(prev - 1, 1))}
                      disabled={subCategoryPage === 1}
                      className="px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:cursor-not-allowed text-white"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium px-4 py-2 rounded-xl" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                      Page {subCategoryPage} of {subCategoryTotalPages}
                    </span>
                    <button
                      onClick={() => setSubCategoryPage((prev) => Math.min(prev + 1, subCategoryTotalPages))}
                      disabled={subCategoryPage === subCategoryTotalPages}
                      className="px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:cursor-not-allowed text-white"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 rounded-2xl shadow-lg text-center" style={{ background: 'var(--color-bg)' }}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-800 flex items-center justify-center">
                  <FaLayerGroup className="text-4xl opacity-50" style={{ color: 'var(--color-text)' }} />
                </div>
                <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                  No subcategories available.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {selectedCategory.current && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div
            ref={categoryCardRef}
            className="p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100"
            style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FaTags className="text-pink-500" />
              Edit Category
            </h3>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-category-name"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Name
                </label>
                <input
                  id="edit-category-name"
                  type="text"
                  value={editCategoryForm.name}
                  onChange={(e) =>
                    setEditCategoryForm({
                      ...editCategoryForm,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-category-description"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Description
                </label>
                <textarea
                  id="edit-category-description"
                  value={editCategoryForm.description}
                  onChange={(e) =>
                    setEditCategoryForm({
                      ...editCategoryForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Status
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      value="true"
                      checked={editCategoryForm.isActive === true}
                      onChange={() =>
                        setEditCategoryForm({
                          ...editCategoryForm,
                          isActive: true,
                        })
                      }
                      className="mr-2 text-blue-600 focus:ring-blue-400"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isActive"
                      value="false"
                      checked={editCategoryForm.isActive === false}
                      onChange={() =>
                        setEditCategoryForm({
                          ...editCategoryForm,
                          isActive: false,
                        })
                      }
                      className="mr-2 text-blue-600 focus:ring-blue-400"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>Inactive</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Category"}
                </button>
                <button
                  type="button"
                  onClick={() => (selectedCategory.current = null)}
                  className="px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm"
                  style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit SubCategory Modal */}
      {selectedSubCategory.current && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div
            ref={subCategoryCardRef}
            className="p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100"
            style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FaLayerGroup className="text-purple-500" />
              Edit SubCategory
            </h3>
            <form onSubmit={handleUpdateSubCategory} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-parent-category"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Parent Category
                </label>
                <select
                  id="edit-parent-category"
                  value={editSubCategoryForm.categoryId}
                  onChange={(e) =>
                    setEditSubCategoryForm({
                      ...editSubCategoryForm,
                      categoryId: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  required
                >
                  {allCategories
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="edit-subcategory-name"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Name
                </label>
                <input
                  id="edit-subcategory-name"
                  type="text"
                  value={editSubCategoryForm.name}
                  onChange={(e) =>
                    setEditSubCategoryForm({
                      ...editSubCategoryForm,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-subcategory-description"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Description
                </label>
                <textarea
                  id="edit-subcategory-description"
                  value={editSubCategoryForm.description}
                  onChange={(e) =>
                    setEditSubCategoryForm({
                      ...editSubCategoryForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Status
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subcategory-isActive"
                      value="true"
                      checked={editSubCategoryForm.isActive === true}
                      onChange={() =>
                        setEditSubCategoryForm({
                          ...editSubCategoryForm,
                          isActive: true,
                        })
                      }
                      className="mr-2 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subcategory-isActive"
                      value="false"
                      checked={editSubCategoryForm.isActive === false}
                      onChange={() =>
                        setEditSubCategoryForm({
                          ...editSubCategoryForm,
                          isActive: false,
                        })
                      }
                      className="mr-2 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>Inactive</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm disabled:opacity-50 text-white"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  disabled={subCategoryLoading}
                >
                  {subCategoryLoading ? "Updating..." : "Update SubCategory"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory({ current: null })}
                  className="px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm"
                  style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesTab;

