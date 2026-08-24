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
  slug: '',
  sku: '',
  description: '',
  parentCategoryId: '',
  category: '',
  subCategory: '',
  price: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  isFeatured: false,
  isActive: true,
  images: [],
  features: [],
  specifications: [],
};

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [parentCategoryList, setParentCategoryList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({
    search: '',
    parentCategoryId: '',
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

  // ── Fetch parent categories ───────────────────────────────────────────────
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
      if (filters.search) params.append('q', filters.search);
      if (filters.parentCategoryId) params.append('parentCategoryId', filters.parentCategoryId);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const res = await getData(`product/search?${params.toString()}`);
      if (res?.success) setProducts(res.data || []);
    } catch (error) {
      console.error('searchProducts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchParentCategories();
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredCategories(categoryList);
  }, [categoryList]);

  // ── When parentCategoryId changes in Modal Form ───────────────────────────
  const handleFormParentCategoryChange = (parentId) => {
    setFormData((prev) => ({
      ...prev,
      parentCategoryId: parentId,
      category: '',
      subCategory: '',
    }));
    setSubCategoriesList([]);
    if (!parentId) {
      setFilteredCategories(categoryList);
    } else {
      const filtered = categoryList.filter(
        (c) => (c.parentCategoryId?._id || c.parentCategoryId) === parentId
      );
      setFilteredCategories(filtered);
    }
  };

  // ── When Category changes in Modal Form ──────────────────────────────────
  const handleFormCategoryChange = (catId) => {
    setFormData((prev) => ({ ...prev, category: catId, subCategory: '' }));
    fetchSubCategoriesByCategory(catId);
  };

  // ── Helper: Slug Generator ────────────────────────────────────────────────
  const generateSlugFromName = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // ── Features Handlers ─────────────────────────────────────────────────────
  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = value;
      return { ...prev, features: updated };
    });
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // ── Specifications Handlers ───────────────────────────────────────────────
  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specifications: updated };
    });
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  // ── Image upload handler ──────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newPreviews] }));
  };

  const removeImage = (index) => {
    const removed = formData.images[index];
    if (removed && removed.startsWith('blob:')) URL.revokeObjectURL(removed);
    const existingCount = formData.images.filter((img) => !img.startsWith('blob:')).length;
    if (index >= existingCount) {
      const fileIndex = index - existingCount;
      setUploadedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // ── Build FormData ────────────────────────────────────────────────────────
  const buildFD = () => {
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('slug', formData.slug || generateSlugFromName(formData.name));
    fd.append('sku', formData.sku);
    fd.append('description', formData.description);
    fd.append('parentCategoryId', formData.parentCategoryId);
    fd.append('category', formData.category);
    fd.append('subCategory', formData.subCategory);
    fd.append('price', formData.price);

    // SEO fields
    fd.append('metaTitle', formData.metaTitle);
    fd.append('metaDescription', formData.metaDescription);
    fd.append('metaKeywords', formData.metaKeywords);
    fd.append('canonicalUrl', formData.canonicalUrl);

    fd.append('isFeatured', String(formData.isFeatured));
    fd.append('isActive', String(formData.isActive));
    fd.append(
      'features',
      JSON.stringify(formData.features.filter((f) => f && f.trim() !== ''))
    );
    fd.append(
      'specifications',
      JSON.stringify(
        formData.specifications.filter(
          (s) => s.key && (s.key.trim() !== '' || (s.value && s.value.trim() !== ''))
        )
      )
    );
    uploadedFiles.forEach((file) => fd.append('images', file));
    return fd;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      slug: product.slug || '',
      sku: product.sku || '',
      description: product.description || '',
      parentCategoryId: parentId,
      category: catId,
      subCategory: product.subCategory?._id || product.subCategory || '',
      price: product.price?.toString() || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      metaKeywords: product.metaKeywords || '',
      canonicalUrl: product.canonicalUrl || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive ?? true,
      images: product.images || [],
      features: Array.isArray(product.features) ? product.features : [],
      specifications: Array.isArray(product.specifications)
        ? product.specifications.map((s) => ({ key: s.key || '', value: s.value || '' }))
        : [],
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

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage catalog, images, features, specifications, and SEO metadata</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="ri-grid-fill text-sm"></i> Grid Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="ri-list-check text-sm"></i> List Table
              </button>
            </div>

            <Button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <i className="ri-add-line mr-1"></i>
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Search Name or SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <select
              value={filters.parentCategoryId}
              onChange={(e) => setFilters({ ...filters, parentCategoryId: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">All Parent Categories</option>
              {parentCategoryList.map((pc) => (
                <option key={pc._id} value={pc._id}>{pc.name}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">All Categories</option>
              {categoryList.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={searchProducts}
                className="flex-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Filter
              </button>
              <button
                onClick={() => {
                  setFilters({ search: '', parentCategoryId: '', category: '', subCategory: '', minPrice: '', maxPrice: '' });
                  fetchProducts();
                }}
                className="px-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>
        </Card>

        {/* ════════════════════════════════════════════════════
            CARD GRID VIEW (DEFAULT)
        ════════════════════════════════════════════════════ */}
        {viewMode === 'card' ? (
          isLoading ? (
            <div className="text-center py-16 text-gray-400">
              <i className="ri-loader-4-line animate-spin text-3xl"></i>
              <p className="mt-2 text-sm">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <i className="ri-shopping-bag-line text-4xl text-gray-300"></i>
              <p className="mt-2 text-gray-500 font-medium">No products found</p>
              <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add your first product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Header & Badges */}
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden border-b border-gray-100">
                    <img
                      src={p.images?.[0] || BydefaultImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = BydefaultImg; }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none gap-2">
                      <span className="bg-white/90 backdrop-blur-md text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {p.category?.name || 'General'}
                      </span>
                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                            p.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.isFeatured && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SEO Ready Badge */}
                    {p.metaTitle && (
                      <div className="absolute bottom-2 left-3">
                        <span className="bg-emerald-500/90 text-white backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <i className="ri-search-eye-line"></i> SEO Ready
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                        {p.sku && (
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            SKU: {p.sku}
                          </span>
                        )}
                        {p.parentCategoryId?.name && (
                          <span className="truncate">
                            Chain: {p.parentCategoryId.name}
                          </span>
                        )}
                      </div>

                      {p.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {p.description}
                        </p>
                      )}

                      {/* Specifications & Features preview */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.features?.length > 0 && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            {p.features.length} Features
                          </span>
                        )}
                        {p.specifications?.length > 0 && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                            {p.specifications.length} Specs
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block">Price</span>
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{p.price?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {p.images?.length || 0} Images
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        p.isActive
                          ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center gap-1 px-2.5 transition-colors"
                        title="Edit Product & SEO"
                      >
                        <i className="ri-edit-line"></i> Edit & SEO
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ════════════════════════════════════════════════════
              LIST TABLE VIEW
          ════════════════════════════════════════════════════ */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">SKU / Model</th>
                    <th className="p-4">Category Chain</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        <i className="ri-loader-4-line animate-spin text-2xl"></i> Loading...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || BydefaultImg}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                              onError={(e) => { e.currentTarget.src = BydefaultImg; }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                {p.name}
                                {p.metaTitle && (
                                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                                    SEO Ready
                                  </span>
                                )}
                              </div>
                              {p.isFeatured && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-semibold">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-gray-600">{p.sku || 'N/A'}</td>
                        <td className="p-4 text-xs text-gray-500">
                          <div><span className="font-medium text-gray-700">Parent:</span> {p.parentCategoryId?.name || '—'}</div>
                          <div><span className="font-medium text-gray-700">Category:</span> {p.category?.name || '—'}</div>
                          <div><span className="font-medium text-gray-700">Sub:</span> {p.subCategory?.name || '—'}</div>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">₹{p.price?.toLocaleString('en-IN') || 0}</td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleStatus(p)}
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                              p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                              title="Edit Product & SEO"
                            >
                              <i className="ri-edit-line text-base"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                              title="Delete Product"
                            >
                              <i className="ri-delete-bin-line text-base"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════
            ADD / EDIT PRODUCT MODAL (WITH MULTIPLE FEATURES & SPECS)
        ════════════════════════════════════════════════════ */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-50 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
              {/* Modal Header */}
              <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    <i className="ri-shopping-bag-3-fill text-blue-600"></i>
                    {editingProduct ? 'Edit Product Catalog & SEO' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure specifications, features, images, and Search Engine Optimization (SEO) metadata
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* ── CARD 1: GENERAL INFORMATION ── */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3 text-sm font-bold text-gray-900">
                    <i className="ri-information-fill text-blue-600 text-base"></i>
                    General Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            name: val,
                            metaTitle: prev.metaTitle ? prev.metaTitle : val,
                            slug: prev.slug ? prev.slug : generateSlugFromName(val),
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Premium Dental Chair X1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        SKU / Model Number
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. TMC-DC-2026"
                      />
                    </div>
                  </div>

                  {/* Category Chain */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Parent Category
                      </label>
                      <select
                        value={formData.parentCategoryId}
                        onChange={(e) => handleFormParentCategoryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Parent Category</option>
                        {parentCategoryList.map((pc) => (
                          <option key={pc._id} value={pc._id}>{pc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleFormCategoryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Category</option>
                        {filteredCategories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Sub-Category
                      </label>
                      <select
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        disabled={!formData.category}
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Sub-Category</option>
                        {subCategoriesList.map((sc) => (
                          <option key={sc._id} value={sc._id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Description Summary
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          description: val,
                          metaDescription: prev.metaDescription ? prev.metaDescription : val,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Product summary and key information..."
                    />
                  </div>
                </div>

                {/* ── CARD 2: MULTIPLE FEATURES BUILDER ── */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <i className="ri-checkbox-circle-fill text-blue-600 text-base"></i>
                      Salient Features (Multiple)
                    </div>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <i className="ri-add-line"></i> Add Feature
                    </button>
                  </div>

                  {formData.features.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      No features added yet. Click "+ Add Feature" to add bullet points.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(idx, e.target.value)}
                            placeholder="e.g. Ergonomic design with high mobility"
                            className="flex-1 px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove feature"
                          >
                            <i className="ri-delete-bin-line text-base"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── CARD 3: TECHNICAL SPECIFICATIONS BUILDER (KEY-VALUE FORMAT) ── */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <i className="ri-settings-4-fill text-purple-600 text-base"></i>
                      Technical Specifications (Key & Value Format)
                    </div>
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <i className="ri-add-line"></i> Add Specification
                    </button>
                  </div>

                  {formData.specifications.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      No specifications added yet. Click "+ Add Specification" to add Key & Value parameters.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.specifications.map((spec, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={spec.key}
                              onChange={(e) => updateSpecification(idx, 'key', e.target.value)}
                              placeholder="Key (e.g. Voltage, Weight, KV)"
                              className="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </div>
                          <div className="col-span-6">
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => updateSpecification(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. 230V 50Hz, 65KV)"
                              className="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeSpecification(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove specification"
                            >
                              <i className="ri-delete-bin-line text-base"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── CARD 4: MEDIA GALLERY ── */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <i className="ri-image-add-fill text-blue-600 text-base"></i>
                      <span>Product Media & Images</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs">
                      📷 Recommended Size: <strong>450 × 450 px</strong> (Square 1:1 Ratio)
                    </span>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-blue-50/50 transition-colors"
                    >
                      <i className="ri-cloud-upload-line text-3xl text-gray-400 mb-1 block"></i>
                      <span className="text-xs font-bold text-gray-700 block">Click or Drag images to upload</span>
                      <span className="text-xs text-blue-600 font-semibold block mt-0.5">Recommended Resolution: 1000 × 1000 pixels (1:1 Ratio)</span>
                      <span className="text-[11px] text-gray-400">PNG, JPG, WEBP supported</span>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-3">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-90 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── CARD 5: STATUS TOGGLES ── */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active / Published</span>
                  </label>
                </div>

                {/* ── CARD 6: SEARCH ENGINE OPTIMIZATION (SEO) SUITE ── */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-md space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-search-eye-line text-emerald-400 text-lg"></i>
                      <h3 className="font-bold text-base text-white">
                        Search Engine Optimization (SEO) Settings
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Live SERP Optimization
                    </span>
                  </div>

                  {/* Google SERP Live Search Preview */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-900 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <i className="ri-google-fill text-blue-600 text-sm"></i> Google Search Result Preview
                    </p>
                    <div className="space-y-0.5">
                      <div className="text-xs text-emerald-700 truncate font-mono">
                        https://www.technomac.in/product/{formData.slug || 'product-slug'}
                      </div>
                      <div className="text-base text-blue-800 font-semibold hover:underline truncate cursor-pointer">
                        {formData.metaTitle || formData.name || 'Product Title'} | TECHNOMAC
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {formData.metaDescription || formData.description || 'Add a meta description to make your product stand out in Google search results...'}
                      </div>
                    </div>
                  </div>

                  {/* Meta Title Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Meta Title
                      </label>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded ${
                          formData.metaTitle.length >= 50 && formData.metaTitle.length <= 60
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : formData.metaTitle.length > 60
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {formData.metaTitle.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Premium Dental Chair X1 | High Comfort Medical Chair"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  {/* Meta Description Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Meta Description
                      </label>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded ${
                          formData.metaDescription.length >= 140 && formData.metaDescription.length <= 160
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : formData.metaDescription.length > 160
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {formData.metaDescription.length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Provide a concise, engaging summary highlighting key features..."
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  {/* Custom URL Slug & Auto-Generate Button */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Custom URL Slug
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlugFromName(prev.name),
                          }))
                        }
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                      >
                        Auto-generate from Name
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. premium-dental-chair-x1"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  {/* Meta Keywords & Canonical URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. dental chair, autoclave, technomac"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.technomac.in/product/dental-chair"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50 shadow-md"
                  >
                    {isLoading
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product & SEO'
                      : 'Create Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}