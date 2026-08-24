// import { useEffect, useState } from 'react';
// import AdminLayout from '../../../../components/feature/AdminLayout';
// import Card from '../../../../components/base/Card';
// import Button from '../../../../components/base/Button';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Swal from 'sweetalert2';
// import {
//   postData,
//   getData,
//   patchData,
//   deleteData,
// } from '../../../../services/FetchNodeServices';

// const ITEMS_PER_PAGE = 12;

// const emptyForm = {
//   categoryId: '',
//   subCategoryId: '',
//   title: '',
//   subtitle: '',
//   image: null,
// };

// export default function BannersManagement() {
//   const [banners, setBanners] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingBanner, setEditingBanner] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [formData, setFormData] = useState(emptyForm);
//   const [submitting, setSubmitting] = useState(false);

//   const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);
//   const paginatedBanners = banners.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE,
//   );

//   const resetForm = () => {
//     setFormData(emptyForm);
//     setEditingBanner(null);
//   };

//   // ─── Fetch all banners ────────────────────────────────────────────────────
//   const fetchBanners = async () => {
//     try {
//       setIsLoading(true);
//       // FIX: correct API path — app.use('/api/banner') + router.get('/all')
//       const response = await getData('banner/all');
//       if (response?.success) {
//         setBanners(response.banners || []);
//         setCurrentPage(1);
//       } else {
//         toast.error(response?.message || 'Failed to load banners');
//       }
//     } catch (error) {
//       toast.error('Failed to load banners');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ─── Fetch categories for dropdown ───────────────────────────────────────
//   const fetchCategories = async () => {
//     try {
//       const response = await getData('category/all');
//       if (response?.success) {
//         setCategories(response.data || []); // ← 'categories' ki jagah 'data'
//       }
//     } catch (error) {
//       console.error('fetchCategories error:', error);
//     }
//   };

//   const fetchSubCategoriesByCategory = async (categoryId) => {
//     if (!categoryId) {
//       setSubCategories([]);
//       return;
//     }

//     try {
//       const res = await getData(`sub-category/by-category/${categoryId}`);

//       console.log('SubCategory API Response:', res);

//       if (res?.success) {
//         setSubCategories(res.data || []);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error('Failed to load subcategories');
//     }
//   };

//   useEffect(() => {
//     if (formData.caegoryId) fetchSubCategoriesByCategory(formData.categoryId);
//     else {
//       setSubCategories([]);
//       setFormData((prev) => ({ ...prev, subCategoryId: '' }));
//     }
//   }, [formData.categoryId]);

//   useEffect(() => {
//     fetchBanners();
//     fetchCategories();
//   }, []);

//   // ─── Create / Update ──────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.categoryId) {
//       toast.error('Please select a category');
//       return;
//     }
//     if (!formData.subCategoryId) {
//       toast.error('Please select a Sub Category');
//       return;
//     }
//     if (!formData.title?.trim()) {
//       toast.error('Please enter a title');
//       return;
//     }
//     if (!editingBanner && !formData.image) {
//       toast.error('Please select an image');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const data = new FormData();
//       data.append('categoryId', formData.categoryId);
//       data.append('subCategoryId', formData.subCategoryId);
//       data.append('title', formData.title);
//       data.append('subtitle', formData.subtitle || '');
//       if (formData.image instanceof File) {
//         data.append('image', formData.image);
//       }

//       let response;
//       if (editingBanner) {
//         // FIX: backend now supports PATCH /update/:id (patchData works correctly)
//         response = await patchData(`banner/update/${editingBanner._id}`, data);
//       } else {
//         response = await postData('banner/create', data);
//       }

//       if (response?.success) {
//         toast.success(
//           editingBanner
//             ? 'Banner updated successfully!'
//             : 'Banner created successfully!',
//         );
//         resetForm();
//         setShowAddModal(false);
//         fetchBanners();
//       } else {
//         toast.error(response?.message || 'Something went wrong');
//       }
//     } catch (error) {
//       console.error('handleSubmit error:', error);
//       toast.error('Something went wrong');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ─── Edit banner ──────────────────────────────────────────────────────────
//   const handleEdit = (banner) => {
//     setEditingBanner(banner);
//     setFormData({
//       categoryId: banner.categoryId?._id || '',
//       subCategoryId: banner?.subCategoryId?._id || '',
//       title: banner.title || '',
//       subtitle: banner.subtitle || '',
//       image: banner.image || null, // existing URL (string), not File
//     });
//     setShowAddModal(true);
//   };

//   // ─── Delete banner ────────────────────────────────────────────────────────
//   const handleDelete = async (id) => {
//     const result = await Swal.fire({
//       title: 'Delete Banner?',
//       text: 'This action cannot be undone',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#ef4444',
//       cancelButtonColor: '#6b7280',
//       confirmButtonText: 'Yes, delete it',
//     });
//     if (!result.isConfirmed) return;

//     try {
//       const response = await deleteData(`banner/delete/${id}`);
//       if (response?.success) {
//         toast.success('Banner deleted');
//         fetchBanners();
//       } else {
//         toast.error(response?.message || 'Delete failed');
//       }
//     } catch (error) {
//       toast.error('Delete failed');
//     }
//   };

//   // ─── Pagination helper ────────────────────────────────────────────────────
//   const getPageNumbers = () => {
//     if (totalPages <= 5)
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
//     if (currentPage >= totalPages - 2)
//       return [
//         1,
//         '...',
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     return [
//       1,
//       '...',
//       currentPage - 1,
//       currentPage,
//       currentPage + 1,
//       '...',
//       totalPages,
//     ];
//   };

//   return (
//     <AdminLayout>
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="p-6">
//         {/* ── Header ── */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Banner Management
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Manage promotional banners and advertisements
//             </p>
//           </div>
//           <Button
//             onClick={() => {
//               resetForm();
//               setShowAddModal(true);
//             }}
//             className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
//           >
//             <i className="ri-add-line mr-1"></i>
//             Add Banner
//           </Button>
//         </div>

//         {/* ── Loading ── */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-20">
//             <i className="ri-loader-4-line animate-spin text-3xl text-blue-600"></i>
//             <p className="text-gray-500 ml-3">Loading banners...</p>
//           </div>
//         )}

//         {/* ── Empty state ── */}
//         {!isLoading && banners.length === 0 && (
//           <div className="text-center py-20 text-gray-400">
//             <i className="ri-image-line text-5xl mb-3 block"></i>
//             <p className="text-lg">No banners found</p>
//             <p className="text-sm mt-1">
//               Click "Add Banner" to create your first banner
//             </p>
//           </div>
//         )}

//         {/* ── Banner Grid ── */}
//         {!isLoading && banners.length > 0 && (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//               {paginatedBanners.map((banner) => (
//                 <Card key={banner._id} className="overflow-hidden">
//                   <img
//                     src={banner.image}
//                     alt={banner.title}
//                     className="w-full h-52 object-cover"
//                   />
//                   <div className="p-4">
//                     <div className="flex items-center gap-2 mb-1">
//                       {banner.categoryId?.name && (
//                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
//                           {banner.categoryId.name}
//                         </span>
//                       )}
//                     </div>
//                     <h3 className="font-bold text-lg text-gray-900">
//                       {banner.title}
//                     </h3>
//                     {banner.subtitle && (
//                       <p className="text-gray-600 text-sm mt-1">
//                         {banner.subtitle}
//                       </p>
//                     )}
//                     <div className="flex gap-2 mt-4">
//                       <Button
//                         onClick={() => handleEdit(banner)}
//                         className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
//                       >
//                         <i className="ri-edit-line mr-1"></i> Edit
//                       </Button>
//                       <Button
//                         onClick={() => handleDelete(banner._id)}
//                         className="flex-1 bg-red-600 text-white hover:bg-red-700"
//                       >
//                         <i className="ri-delete-bin-line mr-1"></i> Delete
//                       </Button>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>

//             {/* ── Pagination ── */}
//             {totalPages > 1 && (
//               <div className="mt-8 flex flex-col items-center gap-3">
//                 <p className="text-sm text-gray-500">
//                   Showing{' '}
//                   <span className="font-medium text-gray-700">
//                     {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
//                     {Math.min(currentPage * ITEMS_PER_PAGE, banners.length)}
//                   </span>{' '}
//                   of{' '}
//                   <span className="font-medium text-gray-700">
//                     {banners.length}
//                   </span>{' '}
//                   banners
//                 </p>
//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={() => setCurrentPage((p) => p - 1)}
//                     disabled={currentPage === 1}
//                     className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                   >
//                     ← Prev
//                   </button>
//                   {getPageNumbers().map((page, idx) =>
//                     page === '...' ? (
//                       <span
//                         key={`ellipsis-${idx}`}
//                         className="px-2 py-1.5 text-gray-400 text-sm"
//                       >
//                         ...
//                       </span>
//                     ) : (
//                       <button
//                         key={page}
//                         onClick={() => setCurrentPage(page)}
//                         className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${currentPage === page
//                           ? 'bg-blue-600 text-white border-blue-600'
//                           : 'hover:bg-gray-100'
//                           }`}
//                       >
//                         {page}
//                       </button>
//                     ),
//                   )}
//                   <button
//                     onClick={() => setCurrentPage((p) => p + 1)}
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Next →
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         {/* ════════════════════════════════════════════════════
//             ADD / EDIT MODAL
//         ════════════════════════════════════════════════════ */}
//         {showAddModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold">
//                     {editingBanner ? 'Edit Banner' : 'Add New Banner'}
//                   </h2>
//                   <button
//                     onClick={() => {
//                       setShowAddModal(false);
//                       resetForm();
//                     }}
//                     className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
//                   >
//                     <i className="ri-close-line text-xl"></i>
//                   </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {/* Category */}

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Category *
//                       </label>
//                       <div className="relative">
//                         <select
//                           value={formData.categoryId}
//                           onChange={(e) => {
//                             console.log('Selected Category:', e.target.value);
//                             setFormData({
//                               ...formData,
//                               categoryId: e.target.value,
//                               subCategoryId: '',
//                             });
//                           }}
//                           className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
//                           required
//                         >
//                           <p>Total Categories: {categories.length}</p>

//                           <pre>{JSON.stringify(categories, null, 2)}</pre>
//                           <option value="">Select Category</option>
//                           {categories.map((cat) => {
//                             console.log('Category Item =>', cat);

//                             return (
//                               <option key={cat._id} value={cat._id}>
//                                 {cat.name}
//                               </option>
//                             );
//                           })}
//                         </select>
//                         <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"></i>
//                       </div>
//                     </div>

//                     {/* SubCategory — fetched via GET /product/by-category/:id */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Sub-Category
//                       </label>
//                       <div className="relative">
//                         <select
//                           value={formData.subCategoryId}
//                           onChange={(e) =>
//                             setFormData({
//                               ...formData,
//                               subCategoryId: e.target.value,
//                             })
//                           }
//                           className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
//                           disabled={
//                             !formData.categoryId || subCategories.length === 0
//                           }
//                         >
//                           <option value="">Select Sub-Category</option>
//                           {subCategories.map((sub) => (
//                             <option key={sub._id} value={sub._id}>
//                               {sub.name}
//                             </option>
//                           ))}
//                         </select>
//                         <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"></i>
//                       </div>
//                     </div>
//                   </div>
//                   {/* Title */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Title <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter banner title"
//                       value={formData.title}
//                       onChange={(e) =>
//                         setFormData({ ...formData, title: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                       required
//                     />
//                   </div>

//                   {/* Subtitle */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Subtitle
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter banner subtitle (optional)"
//                       value={formData.subtitle}
//                       onChange={(e) =>
//                         setFormData({ ...formData, subtitle: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     />
//                   </div>

//                   {/* Image */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Banner Image{' '}
//                       {!editingBanner && (
//                         <span className="text-red-500">*</span>
//                       )}
//                     </label>
//                     {/* Show existing image preview when editing */}
//                     {formData.image && typeof formData.image === 'string' && (
//                       <img
//                         src={formData.image}
//                         alt="Current banner"
//                         className="h-32 w-full object-cover rounded-lg mb-2 border border-gray-200"
//                       />
//                     )}
//                     {/* Show new file preview */}
//                     {formData.image instanceof File && (
//                       <img
//                         src={URL.createObjectURL(formData.image)}
//                         alt="New banner preview"
//                         className="h-32 w-full object-cover rounded-lg mb-2 border border-gray-200"
//                       />
//                     )}
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           image: e.target.files?.[0] || null,
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                       required={!editingBanner}
//                     />
//                     {editingBanner && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         Leave empty to keep the current image
//                       </p>
//                     )}
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex gap-3 pt-2">
//                     <Button
//                       type="button"
//                       onClick={() => {
//                         setShowAddModal(false);
//                         resetForm();
//                       }}
//                       className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="submit"
//                       disabled={submitting}
//                       className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {submitting ? (
//                         <>
//                           <i className="ri-loader-4-line animate-spin mr-2"></i>
//                           {editingBanner ? 'Updating...' : 'Creating...'}
//                         </>
//                       ) : editingBanner ? (
//                         'Update Banner'
//                       ) : (
//                         'Create Banner'
//                       )}
//                     </Button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }

import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import {
  postData,
  getData,
  patchData,
  deleteData,
} from '../../../../services/FetchNodeServices';

const ITEMS_PER_PAGE = 12;

const emptyForm = {
  categoryId: '',
  subCategoryId: '',
  title: '',
  subtitle: '',
  deviceType: 'desktop',
  image: null,
};

export default function BannersManagement() {
  const [banners, setBanners] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);
  const paginatedBanners = banners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingBanner(null);
    setSubCategories([]);
  };

  // ─── Fetch all banners ────────────────────────────────────────────────────
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await getData('banner/all');
      if (response?.success) {
        setBanners(response.banners || []);
        setCurrentPage(1);
      } else {
        toast.error(response?.message || 'Failed to load banners');
      }
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Fetch categories ─────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const response = await getData('category/all');
      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('fetchCategories error:', error);
    }
  };

  // ─── Fetch subcategories by category ─────────────────────────────────────
  const fetchSubCategoriesByCategory = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await getData(`sub-category/by-category/${categoryId}`);
      if (res?.success) {
        setSubCategories(res.data || []);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subcategories');
    }
  };

  // ✅ FIX: typo was 'caegoryId' → 'categoryId'
  useEffect(() => {
    if (formData.categoryId) {
      fetchSubCategoriesByCategory(formData.categoryId);
    } else {
      setSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategoryId: '' }));
    }
  }, [formData.categoryId]);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, []);

  // ─── Create / Update ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) return toast.error('Please select a category');
    if (!formData.subCategoryId) return toast.error('Please select a Sub Category');
    if (!formData.title?.trim()) return toast.error('Please enter a title');
    if (!editingBanner && !formData.image) return toast.error('Please select an image');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('categoryId', formData.categoryId);
      data.append('subCategoryId', formData.subCategoryId);
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle || '');
      data.append('deviceType', formData.deviceType || 'desktop');
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }

      let response;
      if (editingBanner) {
        response = await patchData(`banner/update/${editingBanner._id}`, data);
      } else {
        response = await postData('banner/create', data);
      }

      if (response?.success) {
        toast.success(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
        resetForm();
        setShowAddModal(false);
        fetchBanners();
      } else {
        toast.error(response?.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('handleSubmit error:', error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      categoryId: banner.categoryId?._id || '',
      subCategoryId: banner.subCategoryId?._id || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      deviceType: banner.deviceType || 'desktop',
      image: banner.image || null,
    });
    setShowAddModal(true);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Banner?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });
    if (!result.isConfirmed) return;

    try {
      const response = await deleteData(`banner/delete/${id}`);
      if (response?.success) {
        toast.success('Banner deleted');
        fetchBanners();
      } else {
        toast.error(response?.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // ─── Pagination ───────────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="p-6">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-gray-600 mt-1">Manage promotional banners and advertisements</p>
          </div>
          <Button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <i className="ri-add-line mr-1"></i>
            Add Banner
          </Button>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <i className="ri-loader-4-line animate-spin text-3xl text-blue-600"></i>
            <p className="text-gray-500 ml-3">Loading banners...</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && banners.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <i className="ri-image-line text-5xl mb-3 block"></i>
            <p className="text-lg">No banners found</p>
            <p className="text-sm mt-1">Click "Add Banner" to create your first banner</p>
          </div>
        )}

        {/* ── Banner Grid ── */}
        {!isLoading && banners.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedBanners.map((banner) => (
                <Card key={banner._id} className="overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {banner.categoryId?.name && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {banner.categoryId.name}
                        </span>
                      )}
                      {banner.subCategoryId?.name && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {banner.subCategoryId.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-gray-600 text-sm mt-1">{banner.subtitle}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleEdit(banner)}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <i className="ri-edit-line mr-1"></i> Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(banner._id)}
                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                      >
                        <i className="ri-delete-bin-line mr-1"></i> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-sm text-gray-500">
                  Showing{' '}
                  <span className="font-medium text-gray-700">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, banners.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-gray-700">{banners.length}</span>{' '}
                  banners
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-gray-400 text-sm">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-100'
                          }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════
            ADD / EDIT MODAL
        ════════════════════════════════════════════════════ */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Category + SubCategory */}
                  <div className="grid grid-cols-2 gap-4">

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.categoryId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoryId: e.target.value,
                              subCategoryId: '',
                            })
                          }
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                          required
                        >
                          {/* ✅ REMOVED <p> and <pre> debug elements inside <select> — invalid HTML */}
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                      </div>
                    </div>

                    {/* SubCategory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.subCategoryId}
                          onChange={(e) =>
                            setFormData({ ...formData, subCategoryId: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!formData.categoryId || subCategories.length === 0}
                          required
                        >
                          <option value="">
                            {!formData.categoryId
                              ? 'Select category first'
                              : subCategories.length === 0
                                ? 'No subcategories'
                                : 'Select Sub-Category'}
                          </option>
                          {subCategories.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                      </div>
                    </div>
                  </div>

                  {/* Device Type (deviceType) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Type (deviceType) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.deviceType || 'desktop'}
                        onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm bg-white font-medium text-gray-800"
                        required
                      >
                        <option value="desktop">💻 Desktop View Only (1920 × 600 px)</option>
                        <option value="mobile">📱 Mobile View Only (600 × 800 px)</option>
                        <option value="all">🖥️📱 Both Desktop & Mobile Views</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter banner title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="Enter banner subtitle (optional)"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image {!editingBanner && <span className="text-red-500">*</span>}
                    </label>

                    {/* Existing image preview */}
                    {formData.image && typeof formData.image === 'string' && (
                      <img
                        src={formData.image}
                        alt="Current banner"
                        className="h-32 w-full object-cover rounded-lg mb-2 border border-gray-200"
                      />
                    )}

                    {/* New file preview */}
                    {formData.image instanceof File && (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="New banner preview"
                        className="h-32 w-full object-cover rounded-lg mb-2 border border-gray-200"
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files?.[0] || null })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required={!editingBanner}
                    />
                    {editingBanner && (
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to keep the current image
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => { setShowAddModal(false); resetForm(); }}
                      className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          {editingBanner ? 'Updating...' : 'Creating...'}
                        </>
                      ) : editingBanner ? (
                        'Update Banner'
                      ) : (
                        'Create Banner'
                      )}
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