import { useEffect, useState, useMemo, useRef } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';
import {
  postData,
  getData,
  patchData,
  deleteData,
} from '../../../../services/FetchNodeServices';

const ITEMS_PER_PAGE = 9;

const emptyForm = {
  title: '',
  slug: '',
  category: 'General',
  description: '',
  content: '',
  readTime: '5 min read',
  image: null,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  isActive: true,
  isFeatured: false,
};

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'seo'

  const descriptionEditorRef = useRef(null);
  const contentEditorRef = useRef(null);

  const joditConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Write content here...',
      height: 250,
      buttons: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'ul',
        'ol',
        '|',
        'fontsize',
        'paragraph',
        '|',
        'align',
        '|',
        'link',
        '|',
        'undo',
        'redo',
        '|',
        'fullsize',
      ],
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_clear_html',
    }),
    [],
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingBlog(null);
    setIsCustomCategory(false);
    setActiveTab('general');
  };

  // ─── Fetch all blogs ──────────────────────────────────────────────────────
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await getData('blog');
      if (response?.success) {
        setBlogs(response.data || []);
      } else {
        toast.error(response?.message || 'Failed to load blogs');
      }
    } catch (error) {
      toast.error('Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Fetch DB categories ──────────────────────────────────────────────────
  const fetchDbCategories = async () => {
    try {
      const res = await getData('category/all');
      if (res?.success) {
        setDbCategories(res.data || []);
      }
    } catch (error) {
      console.error('fetchDbCategories error:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchDbCategories();
  }, []);

  // ─── Combine Category Options for Dropdown ────────────────────────────────
  const dbCategoryNames = dbCategories.map((c) => c.name).filter(Boolean);

  const allCategoryOptions = Array.from(
    new Set([...dbCategoryNames])
  );

  // ─── Filtered blogs ───────────────────────────────────────────────────────
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !search ||
      blog.title?.toLowerCase().includes(search.toLowerCase()) ||
      blog.category?.toLowerCase().includes(search.toLowerCase()) ||
      blog.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ─── Helper to strip HTML for plain text previews ──────────────────────────
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  // ─── Create / Update ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    if (!formData.category?.trim()) {
      toast.error('Please enter or select a category');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      if (formData.slug?.trim()) data.append('slug', formData.slug.trim());
      data.append('category', formData.category.trim());
      data.append('description', formData.description.trim());
      data.append('content', formData.content.trim());
      data.append('readTime', formData.readTime.trim());

      // SEO fields
      data.append('metaTitle', formData.metaTitle.trim());
      data.append('metaDescription', formData.metaDescription.trim());
      data.append('metaKeywords', formData.metaKeywords.trim());
      data.append('canonicalUrl', formData.canonicalUrl.trim());

      data.append('isActive', String(formData.isActive));
      data.append('isFeatured', String(formData.isFeatured));

      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }

      let response;
      if (editingBlog) {
        response = await patchData(`blog/${editingBlog._id}`, data);
      } else {
        response = await postData('blog', data);
      }

      if (response?.success) {
        toast.success(
          editingBlog
            ? 'Blog updated successfully!'
            : 'Blog created successfully!',
        );
        resetForm();
        setShowAddModal(false);
        fetchBlogs();
      } else {
        toast.error(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('handleSubmit error:', error);
      toast.error('Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    const cat = blog.category || 'General';
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      category: cat,
      description: blog.description || '',
      content: blog.content || '',
      readTime: blog.readTime || '5 min read',
      image: blog.image || null,
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
      canonicalUrl: blog.canonicalUrl || '',
      isActive: blog.isActive ?? true,
      isFeatured: blog.isFeatured ?? false,
    });
    setIsCustomCategory(false);
    setActiveTab('general');
    setShowAddModal(true);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Blog Article?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });
    if (!result.isConfirmed) return;

    try {
      const response = await deleteData(`blog/${id}`);
      if (response?.success) {
        toast.success('Blog deleted');
        fetchBlogs();
      } else {
        toast.error(response?.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // ─── Toggle Active / Featured ─────────────────────────────────────────────
  const toggleBlogStatus = async (blog, field) => {
    try {
      const data = new FormData();
      data.append(field, String(!blog[field]));
      const response = await patchData(`blog/${blog._id}`, data);
      if (response?.success) {
        toast.success(
          `${field === 'isActive' ? 'Status' : 'Featured state'} updated!`,
        );
        fetchBlogs();
      } else {
        toast.error(response?.message || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="p-6">
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blogs Management</h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and optimize articles for SEO and readers
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line mr-1"></i>
            <span>Add Blog</span>
          </Button>
        </div>

        {/* ── Filters Bar ── */}
        <Card className="mb-6">
          <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search blogs by title, description or category..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Total Articles: <span className="font-semibold text-gray-800">{filteredBlogs.length}</span>
            </div>
          </div>
        </Card>

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <i className="ri-loader-4-line animate-spin text-3xl text-blue-600"></i>
            <p className="text-gray-500 ml-3">Loading blogs...</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && filteredBlogs.length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-white rounded-lg border border-gray-100">
            <i className="ri-article-line text-5xl mb-3 block text-gray-300"></i>
            <p className="text-lg font-medium text-gray-600">No blogs found</p>
            <p className="text-sm mt-1 text-gray-400">
              Click "Add Blog" to publish your first article
            </p>
          </div>
        )}

        {/* ── Blog Cards Grid ── */}
        {!isLoading && filteredBlogs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBlogs.map((blog) => (
                <Card key={blog._id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 bg-gray-100">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="ri-image-line text-4xl"></i>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          {blog.category}
                        </span>
                        {blog.isFeatured && (
                          <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                            Featured
                          </span>
                        )}
                      </div>
                      <span
                        className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow ${
                          blog.isActive ? 'bg-emerald-600' : 'bg-gray-500'
                        }`}
                      >
                        {blog.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center text-xs text-gray-400 gap-3 mb-2">
                        <span><i className="ri-time-line mr-1"></i>{blog.readTime}</span>
                        {blog.metaTitle && (
                          <span className="ml-auto text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">
                            SEO Ready
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {stripHtml(blog.description || blog.content)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-gray-100 mt-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between pt-3">
                      <button
                        onClick={() => toggleBlogStatus(blog, 'isFeatured')}
                        className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
                          blog.isFeatured
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <i className="ri-star-line mr-1"></i>
                        {blog.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>

                      <button
                        onClick={() => toggleBlogStatus(blog, 'isActive')}
                        className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
                          blog.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <i className="ri-toggle-line mr-1"></i>
                        {blog.isActive ? 'Deactivate' : 'Publish'}
                      </button>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <Button
                        onClick={() => handleEdit(blog)}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm border border-blue-100 flex items-center justify-center gap-1 py-1.5"
                      >
                        <i className="ri-edit-line"></i> Edit & SEO
                      </Button>
                      <Button
                        onClick={() => handleDelete(blog._id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 text-sm border border-red-100 px-3 py-1.5"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════
            ADD / EDIT BLOG MODAL WITH SEO CONFIG & JODIT EDITOR
        ════════════════════════════════════════════════════ */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingBlog ? 'Edit Blog Article' : 'Create New Blog Article'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure article details, Jodit rich text content, and SEO metadata
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              {/* ── Modal Tabs: General vs SEO ── */}
              <div className="flex border-b border-gray-200 px-6 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'general'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="ri-file-text-line text-base"></i>
                  General Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'seo'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="ri-search-eye-line text-base"></i>
                  SEO Settings
                  {formData.metaTitle && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeTab === 'general' ? (
                  <>
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Blog Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. How Advanced Dental Chairs Improve Patient Comfort"
                        value={formData.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            title: val,
                            // Auto populate meta title if empty
                            metaTitle: prev.metaTitle ? prev.metaTitle : val,
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Category Dropdown & Read Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={
                              isCustomCategory
                                ? 'Custom'
                                : allCategoryOptions.includes(formData.category)
                                ? formData.category
                                : formData.category
                                ? formData.category
                                : ''
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'Custom') {
                                setIsCustomCategory(true);
                                setFormData({ ...formData, category: '' });
                              } else {
                                setIsCustomCategory(false);
                                setFormData({ ...formData, category: val });
                              }
                            }}
                            className="w-full px-3.5 py-2.5 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            required={!isCustomCategory}
                          >
                            <option value="">Select Category</option>
                            {allCategoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                            <option value="Custom">+ Add Custom Category...</option>
                          </select>
                          <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg"></i>
                        </div>

                        {/* Custom Category Input */}
                        {isCustomCategory && (
                          <input
                            type="text"
                            placeholder="Enter new category name..."
                            value={formData.category}
                            onChange={(e) =>
                              setFormData({ ...formData, category: e.target.value })
                            }
                            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 mt-2"
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Read Time
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 5 min read"
                          value={formData.readTime}
                          onChange={(e) =>
                            setFormData({ ...formData, readTime: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Slug */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          Custom URL Slug (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              slug: (prev.title || '')
                                .toLowerCase()
                                .trim()
                                .replace(/[^\w\s-]/g, '')
                                .replace(/[\s_-]+/g, '-')
                                .replace(/^-+|-+$/g, ''),
                            }))
                          }
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
                        >
                          <i className="ri-magic-line"></i> Auto-generate from Name
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. advanced-dental-chair"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description (Excerpt) with Jodit Editor */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Short Description / Excerpt (Rich Text Jodit)
                      </label>
                      <JoditEditor
                        ref={descriptionEditorRef}
                        value={formData.description || ''}
                        config={joditConfig}
                        onBlur={(newContent) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: newContent,
                            metaDescription: prev.metaDescription
                              ? prev.metaDescription
                              : stripHtml(newContent).slice(0, 160),
                          }))
                        }
                      />
                    </div>

                    {/* Full Content with Jodit Editor */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Full Content (Rich Text Jodit)
                      </label>
                      <JoditEditor
                        ref={contentEditorRef}
                        value={formData.content || ''}
                        config={joditConfig}
                        onBlur={(newContent) =>
                          setFormData((prev) => ({ ...prev, content: newContent }))
                        }
                      />
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Cover Image
                      </label>

                      {formData.image && typeof formData.image === 'string' && (
                        <div className="relative mb-2 w-full h-40 rounded-lg overflow-hidden border">
                          <img
                            src={formData.image}
                            alt="Blog preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {formData.image instanceof File && (
                        <div className="relative mb-2 w-full h-40 rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(formData.image)}
                            alt="New blog upload preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image: e.target.files?.[0] || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({ ...formData, isFeatured: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                          Feature on Homepage / Top
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                          Publish Immediately (Active)
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── SEO CONFIGURATION TAB ── */
                  <div className="space-y-4">
                    {/* Google SERP Live Preview Box */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <i className="ri-google-fill text-blue-600"></i> Google Search Result Preview
                      </p>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-xs text-emerald-700 truncate">
                          https://www.technomac.in/blogs/{formData.slug || 'your-blog-slug'}
                        </div>
                        <div className="text-base text-blue-800 font-medium hover:underline truncate">
                          {formData.metaTitle || formData.title || 'Blog Title Goes Here'} | TECHNOMAC
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                          {formData.metaDescription || stripHtml(formData.description) || 'Add a compelling meta description to improve your search click-through rate...'}
                        </div>
                      </div>
                    </div>

                    {/* Meta Title */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          Meta Title
                        </label>
                        <span
                          className={`text-xs ${
                            formData.metaTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-gray-400'
                          }`}
                        >
                          {formData.metaTitle.length}/60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. How Advanced Dental Chairs Improve Patient Comfort"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended length: 50-60 characters. Appears as the main clickable title in Google.
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          Meta Description
                        </label>
                        <span
                          className={`text-xs ${
                            formData.metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-gray-400'
                          }`}
                        >
                          {formData.metaDescription.length}/160 chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Provide a search-friendly summary highlighting key keywords..."
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended length: 150-160 characters. Concise snippet displayed in search results.
                      </p>
                    </div>

                    {/* Meta Keywords */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Meta Keywords (Comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. dental chair, patient comfort, clinic ergonomics, medical equipment"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Canonical URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.technomac.in/blogs/advanced-dental-chair"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Prevents duplicate content penalties if published elsewhere.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting
                      ? 'Saving...'
                      : editingBlog
                      ? 'Update Blog & SEO'
                      : 'Publish Blog'}
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
