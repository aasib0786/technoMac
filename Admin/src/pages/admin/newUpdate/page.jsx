import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import {
    getData,
    postData,
    patchData,
    deleteData,
} from '../../../services/FetchNodeServices.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function NewUpdateManagement() {
    const [updates, setUpdates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showSeoSection, setShowSeoSection] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        subTitle: '',
        description: '',
        pointsText: '',   // textarea — one point per line
        slug: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        canonicalUrl: '',
        imageFile: null,
        imagePreview: '',
    });

    const [filters, setFilters] = useState({ search: '' });

    // ── Helper: Slug Generator ─────────────────────────────────────
    const generateSlugFromName = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // ── FETCH ALL ──────────────────────────────────────────────────
    const fetchUpdates = async () => {
        setIsLoading(true);
        try {
            const res = await getData('newupdate/all');
            if (res?.success) {
                setUpdates(res.data || []);
            } else {
                toast.error(res?.message || 'Failed to fetch updates');
            }
        } catch {
            toast.error('Failed to fetch updates');
        }finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUpdates(); }, []);

    // ── FORM RESET ─────────────────────────────────────────────────
    const resetForm = () => {
        setFormData({
            title: '',
            subTitle: '',
            description: '',
            pointsText: '',
            slug: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            canonicalUrl: '',
            imageFile: null,
            imagePreview: '',
        });
        setEditingUpdate(null);
        setShowModal(false);
        setShowSeoSection(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── OPEN ADD ───────────────────────────────────────────────────
    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };

    // ── OPEN EDIT ──────────────────────────────────────────────────
    const handleEdit = (item) => {
        setEditingUpdate(item);
        setFormData({
            title: item.title || '',
            subTitle: item.subTitle || '',
            description: item.description || '',
            pointsText: (item.points || []).join('\n'),
            slug: item.slug || '',
            metaTitle: item.metaTitle || '',
            metaDescription: item.metaDescription || '',
            metaKeywords: item.metaKeywords || '',
            canonicalUrl: item.canonicalUrl || '',
            imageFile: null,
            imagePreview: item.image || '',
        });
        setShowModal(true);
    };

    // ── IMAGE SELECT ───────────────────────────────────────────────
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            imageFile: file,
            imagePreview: URL.createObjectURL(file),
        }));
        e.target.value = '';
    };

    // ── BUILD FORM DATA ────────────────────────────────────────────
    const buildFD = () => {
        const fd = new FormData();
        fd.append('title', formData.title.trim());
        fd.append("subTitle", formData.subTitle.trim());
        fd.append('description', formData.description.trim());

        // SEO fields
        fd.append('slug', formData.slug || generateSlugFromName(formData.title));
        fd.append('metaTitle', formData.metaTitle);
        fd.append('metaDescription', formData.metaDescription);
        fd.append('metaKeywords', formData.metaKeywords);
        fd.append('canonicalUrl', formData.canonicalUrl);

        // Convert textarea lines → JSON array
        const pointsArr = formData.pointsText
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean);
        fd.append('points', JSON.stringify(pointsArr));

        if (formData.imageFile) fd.append('image', formData.imageFile);
        return fd;
    };

    // ── SUBMIT (CREATE / UPDATE) ───────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) { toast.error('Title is required'); return; }
        if (!formData.subTitle.trim()) { toast.error('Sub Title is required'); return; }
        if (!formData.description.trim()) { toast.error('Description is required'); return; }
        if (!editingUpdate && !formData.imageFile) { toast.error('Cover image is required'); return; }

        setIsLoading(true);
        try {
            const fd = buildFD();
            const res = editingUpdate
                ? await patchData(`newupdate/${editingUpdate._id}`, fd)
                : await postData('newupdate/create', fd);

            if (res?.success) {
                toast.success(`Update ${editingUpdate ? 'updated' : 'created'} successfully!`);
                fetchUpdates();
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

    // ── DELETE ─────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This update will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: '#dc2626',
        });
        if (!confirm.isConfirmed) return;

        try {
            const res = await deleteData(`newupdate/${id}`);
            if (res?.success) {
                setUpdates((prev) => prev.filter((u) => u._id !== id));
                toast.success('Update deleted successfully!');
            } else {
                toast.error(res?.message || 'Failed to delete');
            }
        } catch {
            toast.error('Failed to delete update');
        }
    };

    // ── FILTERED LIST ──────────────────────────────────────────────
    const displayed = updates.filter(
        (u) =>
            !filters.search ||
            u.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
            u.subTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
            u.description?.toLowerCase().includes(filters.search.toLowerCase()),
    );

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const pointCount = formData.pointsText
        .split('\n')
        .filter((p) => p.trim()).length;

    // ── JSX ────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <ToastContainer />
            <div className="p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">New Updates Management</h1>
                        <p className="text-gray-600 mt-1">
                            Manage all updates and SEO metadata — {updates.length} total
                        </p>
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    >
                        <i className="ri-add-line"></i>
                        <span>Add Update</span>
                    </Button>
                </div>

                {/* Search Filter */}
                <Card className="mb-6">
                    <div className="p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Updates
                        </label>
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={filters.search}
                            onChange={(e) => setFilters({ search: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </Card>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {/* Grid Cards */}
                {!isLoading && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayed.map((item) => (
                                <Card key={item._id} className="overflow-hidden group flex flex-col justify-between">
                                    {/* Cover Image */}
                                    <div
                                        className="relative cursor-pointer"
                                        onClick={() => setPreviewImage(item.image)}
                                    >
                                        <img
                                            src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                            alt={item.title}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                            <i className="ri-zoom-in-line text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                                        </div>

                                        {item.metaTitle && (
                                            <span className="absolute bottom-2 left-2 bg-emerald-500/90 text-white backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                <i className="ri-search-eye-line"></i> SEO Ready
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                                {item.title || '—'}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                                {item.subTitle || 'No subTitle'}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                                {item.description || 'No description'}
                                            </p>

                                            {/* Points Preview */}
                                            {item.points?.length > 0 && (
                                                <ul className="mb-3 space-y-1">
                                                    {item.points.slice(0, 3).map((pt, i) => (
                                                        <li key={i} className="flex items-center gap-1 text-xs text-gray-600">
                                                            <i className="ri-check-line text-green-500 text-xs flex-shrink-0"></i>
                                                            <span className="truncate">{pt}</span>
                                                        </li>
                                                    ))}
                                                    {item.points.length > 3 && (
                                                        <li className="text-xs text-gray-400 pl-4">
                                                            +{item.points.length - 3} more
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400 mb-3">
                                                Added: {formatDate(item.createdAt)}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm"
                                                >
                                                    <i className="ri-edit-line mr-1"></i> Edit & SEO
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Empty State */}
                        {displayed.length === 0 && (
                            <div className="text-center py-16">
                                <i className="ri-newspaper-line text-5xl text-gray-300 mb-4 block"></i>
                                <p className="text-gray-500 text-lg font-medium">No updates found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {filters.search ? 'Try a different search term' : 'Add your first update'}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* ── ADD / EDIT MODAL ── */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6">

                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {editingUpdate ? 'Edit Update & SEO' : 'Add New Update'}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Configure title, cover image, points, and Search Engine Optimization (SEO)
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetForm}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <i className="ri-close-line text-xl"></i>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    title: val,
                                                    metaTitle: prev.metaTitle ? prev.metaTitle : val,
                                                    slug: prev.slug ? prev.slug : generateSlugFromName(val),
                                                }));
                                            }}
                                            placeholder="e.g. Advanced Dental Chair Technology"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sub Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subTitle}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, subTitle: e.target.value }))}
                                            placeholder="e.g. Smart Healthcare Equipment"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description *
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    description: val,
                                                    metaDescription: prev.metaDescription ? prev.metaDescription : val,
                                                }));
                                            }}
                                            placeholder="Describe this update..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Bullet Points */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bullet Points
                                            <span className="text-gray-400 font-normal ml-1">(one per line, optional)</span>
                                        </label>
                                        <textarea
                                            rows="4"
                                            value={formData.pointsText}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, pointsText: e.target.value }))}
                                            placeholder={`Premium patient comfort\nModern ergonomic design\nLED operating light\nAdvanced control panel`}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            {pointCount} point{pointCount !== 1 ? 's' : ''} added
                                        </p>
                                    </div>

                                    {/* Cover Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cover Image {!editingUpdate && '*'}
                                            {editingUpdate && (
                                                <span className="text-gray-400 font-normal ml-1">
                                                    (leave empty to keep existing)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                                        >
                                            <i className="ri-image-add-line text-2xl text-gray-400 mb-1 block"></i>
                                            <p className="text-sm text-gray-500">Click to upload cover image</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PNG, JPG, WEBP supported (recommended: 16:9 ratio)
                                            </p>
                                        </button>

                                        {/* Image Preview */}
                                        {formData.imagePreview && (
                                            <div className="mt-3 relative inline-block">
                                                <img
                                                    src={formData.imagePreview}
                                                    alt="Preview"
                                                    className="h-32 w-auto rounded-lg border border-gray-200 object-cover"
                                                />
                                                {formData.imageFile && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                imageFile: null,
                                                                imagePreview: editingUpdate?.image || '',
                                                            }))
                                                        }
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        <i className="ri-close-line"></i>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── SEO SECTION ── */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowSeoSection(!showSeoSection)}
                                            className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                <i className="ri-search-eye-line text-blue-600"></i>
                                                Search Engine Optimization (SEO) Settings
                                            </span>
                                            <i
                                                className={`ri-arrow-down-s-line transition-transform ${
                                                    showSeoSection ? 'rotate-180' : ''
                                                }`}
                                            ></i>
                                        </button>

                                        {showSeoSection && (
                                            <div className="space-y-4 pt-4 px-1">
                                                {/* Google SERP Live Preview Box */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <i className="ri-google-fill text-blue-600"></i> Google Search Result Preview
                                                    </p>
                                                    <div className="bg-white p-3 rounded border border-gray-200">
                                                        <div className="text-xs text-emerald-700 truncate">
                                                            https://www.technomac.in/updates/{formData.slug || 'update-slug'}
                                                        </div>
                                                        <div className="text-base text-blue-800 font-medium hover:underline truncate">
                                                            {formData.metaTitle || formData.title || 'Update Title'} | TECHNOMAC
                                                        </div>
                                                        <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                            {formData.metaDescription || formData.description || 'Add meta description...'}
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
                                                        placeholder="e.g. Advanced Dental Chair Technology | TECHNOMAC Update"
                                                        value={formData.metaTitle}
                                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
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
                                                        placeholder="Provide a search-friendly summary..."
                                                        value={formData.metaDescription}
                                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* Meta Keywords */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Meta Keywords (Comma separated)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. dental technology, medical updates, technomac"
                                                        value={formData.metaKeywords}
                                                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* Custom URL Slug */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Custom URL Slug (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. advanced-dental-chair-technology"
                                                        value={formData.slug}
                                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* Canonical URL */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Canonical URL (Optional)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://www.technomac.in/updates/advanced-dental-chair-technology"
                                                        value={formData.canonicalUrl}
                                                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isLoading
                                                ? 'Processing...'
                                                : editingUpdate
                                                    ? 'Update & Save SEO'
                                                    : 'Create Update'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── IMAGE LIGHTBOX ── */}
                {previewImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div
                            className="relative max-w-4xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300 text-3xl"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                            <img
                                src={previewImage}
                                alt="Update Preview"
                                className="w-full max-h-[80vh] object-contain rounded-lg"
                            />
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}