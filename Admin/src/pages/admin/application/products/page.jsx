import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import BydefaultImg from '../../../images/landing_doctors.png';
import { getData, postData, patchData, deleteData } from '../../../../services/FetchNodeServices';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const emptyForm = {
  name: '',
  model: '',
  description: '',
  parentCategoryId: '',  // ✅ NEW
  category: '',
  subCategory: '',
  price: '',
  isFeatured: false,
  isActive: true,
  images: [],
  features: [],
  specifications: [],
};

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [parentCategoryList, setParentCategoryList] = useState([]);  // ✅ NEW
  const [categoryList, setCategoryList] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);  // ✅ filtered by parent
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({
    search: '',
    parentCategoryId: '',  // ✅ NEW
    category: '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
  });

  // ── Fetch all products ────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getData('product');
      if (res?.success) {
        setProducts(res.data || []);
      } else {
        toast.error(res?.message || 'Failed to fetch products');
      }
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fetch parent categories ✅ NEW ────────────────────────────────────────
  const fetchParentCategories = async () => {
    try {
      const res = await getData('parentCategory/all');
      if (res?.success) setParentCategoryList(res.data || []);
    } catch (error) {
      console.error('fetchParentCategories:', error);
    }
  };

  // ── Fetch categories ──────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await getData('category/all');
      if (res?.success) setCategoryList(res.data || []);
    } catch (error) {
      console.error('fetchCategories:', error);
    }
  };

  // ── Fetch subcategories by category ──────────────────────────────────────
  const fetchSubCategoriesByCategory = async (categoryId) => {
    if (!categoryId) { setSubCategoriesList([]); return; }
    try {
      const res = await getData(`sub-category/by-category/${categoryId}`);
      if (res?.success) setSubCategoriesList(res.data || []);
    } catch (error) {
      console.error('fetchSubCategories:', error);
    }
  };

  // ── Search products ───────────────────────────────────────────────────────
  const searchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.search)           params.append('q', filters.search);
      if (filters.parentCategoryId) params.append('parentCategoryId', filters.parentCategoryId);
      if (filters.category)         params.append('category', filters.category);
      if (filters.subCategory)      params.append('subCategory', filters.subCategory);
      if (filters.minPrice)         params.append('minPrice', filters.minPrice);
      if (filters.maxPrice)         params.append('maxPrice', filters.maxPrice);

      if (!params.toString()) { fetchProducts(); return; }

      const res = await getData(`product/search?${params.toString()}`);
      if (res?.success) setProducts(res.data || []);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    fetchParentCategories();
    fetchCategories();
  }, []);

  // ✅ Filter categories when parentCategoryId changes in form
  useEffect(() => {
    if (formData.parentCategoryId) {
      const filtered = categoryList.filter(
        (cat) => (cat.parentCategoryId?._id || cat.parentCategoryId) === formData.parentCategoryId
      );
      setFilteredCategories(filtered);
      // Reset category if no longer valid
      const stillValid = filtered.some((c) => c._id === formData.category);
      if (!stillValid) setFormData((prev) => ({ ...prev, category: '', subCategory: '' }));
    } else {
      setFilteredCategories(categoryList);
    }
  }, [formData.parentCategoryId, categoryList]);

  // Fetch subcategories when category changes in form
  useEffect(() => {
    if (formData.category) fetchSubCategoriesByCategory(formData.category);
    else { setSubCategoriesList([]); setFormData((prev) => ({ ...prev, subCategory: '' })); }
  }, [formData.category]);

  // Search debounce
  useEffect(() => {
    const hasFilter = filters.search || filters.parentCategoryId || filters.category || filters.subCategory || filters.minPrice || filters.maxPrice;
    if (!hasFilter) return;
    const timeout = setTimeout(searchProducts, 500);
    return () => clearTimeout(timeout);
  }, [filters.search, filters.parentCategoryId, filters.category, filters.subCategory, filters.minPrice, filters.maxPrice]);

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const toAdd = files.slice(0, 10 - formData.images.length);
    setUploadedFiles((prev) => [...prev, ...toAdd]);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...toAdd.map((f) => URL.createObjectURL(f))] }));
    e.target.value = '';
  };

  const removeImage = (index) => {
    const existingCount = formData.images.length - uploadedFiles.length;
    if (index >= existingCount) {
      URL.revokeObjectURL(formData.images[index]);
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index - existingCount));
    }
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // ── Build FormData ────────────────────────────────────────────────────────
  const buildFD = () => {
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('model', formData.model);
    fd.append('description', formData.description);
    fd.append('category', formData.category);
    fd.append('subCategory', formData.subCategory);
    fd.append('price', formData.price);
    fd.append('isFeatured', String(formData.isFeatured));
    fd.append('isActive', String(formData.isActive));
    fd.append('features', JSON.stringify(formData.features));
    fd.append('specifications', JSON.stringify(formData.specifications));
    uploadedFiles.forEach((file) => fd.append('images', file));
    return fd;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!formData.category)    return toast.error('Please select a Category');
    // if (!formData.subCategory) return toast.error('Please select a Sub-Category');

    setIsLoading(true);
    try {
      const fd = buildFD();
      const res = editingProduct
        ? await patchData(`product/${editingProduct._id}`, fd)
        : await postData('product', fd);

      if (res?.success) {
        toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
        fetchProducts();
        resetForm();
      } else {
        toast.error(res?.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    formData.images.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
    setFormData(emptyForm);
    setUploadedFiles([]);
    setShowAddModal(false);
    setEditingProduct(null);
    setSubCategoriesList([]);
    setFilteredCategories(categoryList);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (product) => {
    setEditingProduct(product);
    const catId = product.category?._id || product.category || '';
    const parentId = product.parentCategoryId?._id || product.parentCategoryId || '';
    setFormData({
      name: product.name || '',
      model: product.model || '',
      description: product.description || '',
      parentCategoryId: parentId,
      category: catId,
      subCategory: product.subCategory?._id || product.subCategory || '',
      price: product.price?.toString() || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive ?? true,
      images: product.images || [],
      features: product.features || [],
      specifications: product.specifications || [],
    });
    if (catId) fetchSubCategoriesByCategory(catId);
    setShowAddModal(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (productId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await deleteData(`product/${productId}`);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        toast.success('Product deleted successfully!');
      } else {
        toast.error(res?.message || 'Failed to delete product');
      }
    } catch { toast.error('Failed to delete product!'); }
  };

  // ── Toggle status ─────────────────────────────────────────────────────────
  const toggleStatus = async (product) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!product.isActive));
      const res = await patchData(`product/${product._id}`, fd);
      if (res?.success) {
        toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
        fetchProducts();
      } else {
        toast.error(res?.message || 'Failed to update status');
      }
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <Button onClick={() => { setFormData(emptyForm); setShowAddModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <i className="ri-add-line"></i>
            <span>Add Product</span>
          </Button>
        </div>

        {/* Search Filter */}
        <Card className="mb-6">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input type="text" placeholder="Name or model..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* ✅ NEW: Parent Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select value={filters.parentCategoryId}
                onChange={(e) => setFilters((prev) => ({ ...prev, parentCategoryId: e.target.value, category: '', subCategory: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All</option>
                {parentCategoryList.map((pc) => (
                  <option key={pc._id} value={pc._id}>{pc.name}</option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={filters.category}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, category: e.target.value, subCategory: '' }));
                  fetchSubCategoriesByCategory(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Categories</option>
                {categoryList.filter((cat) =>
                  !filters.parentCategoryId ||
                  (cat.parentCategoryId?._id || cat.parentCategoryId) === filters.parentCategoryId
                ).map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sub Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
              <select value={filters.subCategory}
                onChange={(e) => setFilters((prev) => ({ ...prev, subCategory: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Sub Categories</option>
                {subCategoriesList.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} min="0"
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <span className="text-gray-400">—</span>
                <input type="number" placeholder="Max" value={filters.maxPrice} min="0"
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-shopping-bag-line text-4xl text-gray-400 mb-4 block"></i>
            <p className="text-gray-500">No products found</p>
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images?.length > 0 ? product.images[0] : BydefaultImg}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {product.isFeatured && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                      Featured
                    </span>
                  )}
                  {product.images?.length > 1 && (
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-black bg-opacity-50 rounded-full text-xs text-white">
                      +{product.images.length - 1}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {/* ✅ Breadcrumb: ParentCategory › Category › SubCategory */}
                  <p className="text-xs text-gray-400 mb-1">
                    {[
                      product.parentCategoryId?.name,
                      product.category?.name,
                      product.subCategory?.name,
                    ].filter(Boolean).join(' › ')}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-0.5">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">Model: {product.model}</p>
                  <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">{product.description}</p>
                  {/* <p className="text-sm font-semibold text-green-600 mb-3">₹{product.price}</p> */}

                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm border border-blue-100">
                      <i className="ri-edit-line mr-1"></i>Edit
                    </Button>
                    <Button onClick={() => toggleStatus(product)}
                      className={`flex-1 text-sm font-medium flex items-center justify-center gap-1.5 border ${
                        product.isActive
                          ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                          : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                      }`}>
                      <i className={`text-sm ${product.isActive ? 'ri-toggle-fill' : 'ri-toggle-line'}`}></i>
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button onClick={() => handleDelete(product._id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-3 border border-red-100">
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input type="text" value={formData.name} required
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                    <input type="text" value={formData.model} required
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea rows={3} value={formData.description} required
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>

                  {/* ✅ NEW: Parent Category → Category → SubCategory chain */}
                  <div className="grid grid-cols-1 gap-3">

                    {/* Parent Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                      <div className="relative">
                        <select value={formData.parentCategoryId}
                          onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value, category: '', subCategory: '' })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm">
                          <option value="">All Parent Categories</option>
                          {parentCategoryList.map((pc) => (
                            <option key={pc._id} value={pc._id}>{pc.name}</option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <div className="relative">
                          {/* ✅ FIX: removed <p> and <pre> debug elements from inside <select> */}
                          <select value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm">
                            <option value="">Select Category</option>
                            {filteredCategories.map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                          <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                      </div>

                      {/* SubCategory */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                        <div className="relative">
                          <select value={formData.subCategory}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                            disabled={!formData.category || subCategoriesList.length === 0}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                            <option value="">
                              {!formData.category ? 'Select category first' : subCategoriesList.length === 0 ? 'No sub-categories' : 'Select Sub-Category'}
                            </option>
                            {subCategoriesList.map((sub) => (
                              <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                          </select>
                          <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" value={formData.price} required min="0" step="0.01"
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div> */}

                  {/* Features */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Salient Features</label>
                      <button type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }))}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <i className="ri-add-circle-line"></i> Add Feature
                      </button>
                    </div>
                    {formData.features.length === 0 && <p className="text-xs text-gray-400 italic">No features added yet.</p>}
                    <div className="space-y-2">
                      {formData.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <i className="ri-checkbox-circle-fill text-blue-500"></i>
                          <input type="text" value={feat} placeholder={`Feature ${idx + 1}`}
                            onChange={(e) => {
                              const updated = [...formData.features];
                              updated[idx] = e.target.value;
                              setFormData((prev) => ({ ...prev, features: updated }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                          <button type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))}
                            className="text-red-400 hover:text-red-600">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Technical Specifications</label>
                      <button type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }))}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <i className="ri-add-circle-line"></i> Add Spec
                      </button>
                    </div>
                    {formData.specifications.length === 0 && <p className="text-xs text-gray-400 italic">No specifications added yet.</p>}
                    <div className="space-y-2">
                      {formData.specifications.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="text" value={spec.key} placeholder="Label (e.g. Capacity)"
                            onChange={(e) => {
                              const updated = [...formData.specifications];
                              updated[idx] = { ...updated[idx], key: e.target.value };
                              setFormData((prev) => ({ ...prev, specifications: updated }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                          <input type="text" value={spec.value} placeholder="Value (e.g. 12L)"
                            onChange={(e) => {
                              const updated = [...formData.specifications];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              setFormData((prev) => ({ ...prev, specifications: updated }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                          <button type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }))}
                            className="text-red-400 hover:text-red-600">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured + Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                      <div className="relative">
                        <select value={formData.isFeatured.toString()}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.value === 'true' })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm">
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <select value={formData.isActive.toString()}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm">
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (max 10)</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                        <Button type="button" onClick={() => fileInputRef.current?.click()}
                          disabled={formData.images.length >= 10}
                          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm">
                          <i className="ri-upload-2-line"></i>Upload Images
                        </Button>
                        <span className="text-sm text-gray-500">{formData.images.length} / 10</span>
                      </div>
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img src={img} alt={`img-${idx}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                              <button type="button" onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                                <i className="ri-close-line"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <Button type="button" onClick={resetForm} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                      {isLoading ? 'Processing...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}