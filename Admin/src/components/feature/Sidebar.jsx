import { use, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';

export default function Sidebar({ isOpen, onClose, isDarkMode }) {
  const [expandedItems, setExpandedItems] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch permissions
  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      const perms = response?.data?.[0]?.permissions || {};
      setPermissions(perms);
      console.log("Loaded permissions:", perms);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
    }
  };

  useEffect(() => {
    if (user?.role) fetchRoles();
  }, [user?.role]);

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNavigation = (path) => {
    console.log('CLICKED');
    console.log('Width:', window.innerWidth);

    navigate(path);

    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Build menu dynamically based on permissions
  const menuItems = [
    {
      title: 'System Management',
      icon: 'ri-settings-3-line',
      children: [
        { title: 'Banners',icon: 'ri-image-line', path: '/admin/application/banners' },
        { title: 'Parent Category', icon: 'ri-layout-grid-line',path: '/admin/application/parentCategory' },
        { title: 'Categories', icon: 'ri-layout-grid-line',path: '/admin/application/categories' },
        { title: 'Sub-Categories',icon: 'ri-node-tree', path: '/admin/application/subcategories' },
        { title: 'Products',icon: 'ri-shopping-bag-line', path: '/admin/application/products' },
      ],
    },
    {
      title: 'New Update',
      icon: 'ri-notification-3-line',
      path: '/admin/new_update',
    },
    {
      title: 'Enquiries',
      icon: 'ri-question-answer-line',
      path: '/admin/enquiries',
    },
    {
      title: 'Catalogue Download',
      icon: 'ri-download-2-line',
      path: '/admin/application/CatalogueDownloadsManagement',
    },
    { title: 'Warranties',icon: 'ri-shield-check-line', path: '/admin/application/warranties' },
    { title: 'Certificate', icon: 'ri-medal-line', path: '/admin/application/certificate' },
    { title: 'Catalogue', icon: 'ri-file-list-3-line', path: '/admin/application/catalogue' },
    { title: 'FAQs',icon: 'ri-questionnaire-line', path: '/admin/application/faqs' },
    { title: 'Blogs', icon: 'ri-article-line', path: '/admin/application/blogs' },
    { title: 'Contact Info', icon: 'ri-contacts-book-line', path: '/admin/application/contact' },
    { title: 'Subscription',icon: 'ri-mail-send-line', path: '/admin/application/subscription' },
    { title: 'Review', icon: 'ri-star-half-line',path: '/admin/application/review' },
    { title: 'Client',icon: 'ri-user-heart-line', path: '/admin/application/client' },
    { title: 'CallBack List',icon: 'ri-phone-line', path: '/admin/application/callback' },
  ];
  console.log("GGGGGGGG:=>", permissions)
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 border-r transform transition-all duration-300 ease-in-out z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-shirt-line text-white text-lg"></i>
              </div>
              <span
                className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                TechnoMac Admin
              </span>
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden p-1 rounded-md transition-colors ${isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'bg-blue-50 text-black hover:text-blue-500 rounded-3xl'
                }`}
            >
              <i className="ri-close-line text-blue-700"></i>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(index)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'bg-blue-50 hover:text-blue-500 rounded-3xl'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <i
                            className={`${item.icon} text-blue-500 text-lg`}
                          ></i>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <i
                          className={`ri-arrow-down-s-line transition-transform ${expandedItems ? 'rotate-180' : ''
                            }`}
                        ></i>
                      </button>
                      {expandedItems && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <button
                                onClick={() => handleNavigation(child.path)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === child.path
                                  ? 'bg-blue-100 text-blue-700'
                                  : isDarkMode
                                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                    : 'bg-blue-50 hover:text-blue-500 rounded-3xl'
                                  }`}
                              >
                                {child.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'bg-blue-50 hover:text-blue-500 rounded-3xl'
                        }`}
                    >
                      <i className={`${item.icon} text-lg text-blue-500`}></i>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
