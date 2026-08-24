import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import styles from "./Header.module.css";
import logo from "../../../../Images/logo-chat.png";
import { getData } from "../../../services/FetchNodeServices";
import AttractiveLoader from "../../common/Loader/AttractiveLoader";
import { FaBars, FaTimes, FaPhoneAlt, FaEnvelope, FaChevronDown, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaSearch, FaSpinner} from "react-icons/fa";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryCache, setSubCategoryCache] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // ─── Mobile Products Accordion States ──────────────────────────────────────
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);

  // ─── Search States ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const [contactInfo, setContactInfo] = useState({
    salesPhone: "",
    servicePhone: "",
    email: "",
    address: "",
    whatsappPhone: "",
  });

  const toSlug = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // ─── 1. Fetch Contact Info ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await getData("contact-info");
        if (res?.success && res?.data) {
          setContactInfo({
            salesPhone: res.data.salesPhone || "",
            servicePhone: res.data.servicePhone || "+91 9311125574",
            email: res.data.email || "info@technomac.in",
            address: res.data.address || "",
            whatsappPhone: res.data.whatsappPhone || "+919311125574",
          });
        }
      } catch (err) {
        console.error("fetchContactInfo error:", err);
      }
    };
    fetchContactInfo();
  }, []);

  // ─── 2. Fetch all parent categories on mount ────────────────────────────────
  useEffect(() => {
    const fetchAllCategory = async () => {
      try {
        const response = await getData("parentCategory/all");
        if (response?.success === true && Array.isArray(response.data)) {
          setCategories(response.data);
          if (response.data.length > 0) {
            setActiveCategory(response.data[0]);
          }
        }
      } catch (e) {
        console.error("Category fetch failed:", e?.message);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchAllCategory();
  }, []);

  // ─── 3. Fetch subcategories when activeCategory changes (desktop hover) ────
  useEffect(() => {
    if (!activeCategory?._id) return;
    const categoryId = activeCategory._id;

    if (subCategoryCache[categoryId]) {
      setSubCategories(subCategoryCache[categoryId]);
      return;
    }

    const fetchSubCategories = async () => {
      setLoadingSubCategories(true);
      try {
        const response = await getData(`category/by-parent/${categoryId}`);
        if (response?.success === true && Array.isArray(response.data)) {
          setSubCategories(response.data);
          setSubCategoryCache((prev) => ({
            ...prev,
            [categoryId]: response.data,
          }));
        } else {
          setSubCategories([]);
        }
      } catch (e) {
        console.error("SubCategory fetch failed:", e?.message);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [activeCategory?._id]);

  // ─── 3b. Prefetch subcategories for ALL categories when mobile Products
  //         accordion is opened, so each category can show its own expand
  //         arrow / subcategory list (mobile only — does not touch desktop
  //         hover logic or the "subCategories" state used by it). ─────────────
  useEffect(() => {
    if (!mobileProductsOpen || categories.length === 0) return;

    const idsToFetch = categories
      .map((c) => c._id)
      .filter((id) => id && !subCategoryCache[id]);

    if (idsToFetch.length === 0) return;

    const fetchMobileSubCategories = async () => {
      try {
        const results = await Promise.all(
          idsToFetch.map((id) => getData(`category/by-parent/${id}`))
        );
        setSubCategoryCache((prev) => {
          const updated = { ...prev };
          idsToFetch.forEach((id, idx) => {
            const res = results[idx];
            updated[id] =
              res?.success === true && Array.isArray(res.data) ? res.data : [];
          });
          return updated;
        });
      } catch (e) {
        console.error("Mobile subcategory prefetch failed:", e?.message);
      }
    };

    fetchMobileSubCategories();
  }, [mobileProductsOpen, categories, subCategoryCache]);

  // ─── 4. Sticky Navbar on Scroll ────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── 5. Live Search Debounce ───────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await getData(`product/search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        if (res?.success && Array.isArray(res.data)) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Live search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── 6. Close dropdown on outside click or Escape key ──────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideDesktop = searchRef.current && !searchRef.current.contains(e.target);
      const isOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(e.target);
      if (isOutsideDesktop && isOutsideMobile) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ─── 7. Reset mobile Products accordion whenever the mobile drawer closes ──
  useEffect(() => {
    if (!menuOpen) {
      setMobileProductsOpen(false);
      setMobileExpandedCategory(null);
    }
  }, [menuOpen]);

  // ─── Submit Search Form (Enter or search button) ───────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setMenuOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // ─── Click Single Product in Dropdown ──────────────────────────────────────
  const handleProductSelect = (product) => {
    setShowDropdown(false);
    setSearchQuery("");
    setMenuOpen(false);
    const targetSlug = product?.slug || toSlug(product?.name) || product?._id;
    router.push(`/product/${targetSlug}`);
  };

  // ─── View All Results ───────────────────────────────────────────────────────
  const handleViewAllResults = () => {
    setShowDropdown(false);
    setMenuOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // ─── "Products" nav item click — desktop keeps its normal Link navigation,
  //     mobile (<=991px, matching the existing CSS breakpoint) toggles the
  //     accordion instead of navigating away. ─────────────────────────────────
  const handleProductsClick = (e) => {
    if (typeof window !== "undefined" && window.innerWidth <= 991) {
      e.preventDefault();
      setMobileProductsOpen((prev) => !prev);
    } else {
      setMenuOpen(false);
    }
  };

  // ─── Mobile: expand/collapse a category, or navigate straight through if
  //     it has no subcategories. ──────────────────────────────────────────────
  const handleMobileCategoryClick = (category) => {
    const catId = category._id;
    const catName = category.name || category.title || category.categoryName;
    const catSubs = subCategoryCache[catId];

    if (!catSubs) {
      // Still loading subcategories for this category — ignore tap for now.
      return;
    }

    if (catSubs.length > 0) {
      setMobileExpandedCategory((prev) => (prev === catId ? null : catId));
    } else {
      setMenuOpen(false);
      router.push(`/products?category=${toSlug(catName)}`);
    }
  };

  return (
    <>
      <header className={`${styles.header} ${sticky ? styles.sticky : ""}`}>

        {/* TOP HEADER */}
        <div className={styles.topHeader}>
          <div className="container">
            <div className={styles.topHeaderWrapper}>
              <div className={styles.topLeft}>
                {contactInfo?.servicePhone && (
                  <a href={`tel:${contactInfo.servicePhone.replace(/[^\d+]/g, "")}`}>
                    <FaPhoneAlt /> {contactInfo.servicePhone}
                  </a>
                )}
                {contactInfo?.email && (
                  <a href={`mailto:${contactInfo.email}`}>
                    <FaEnvelope /> {contactInfo.email}
                  </a>
                )}
              </div>
              <div className={styles.topRight}>
                <a href="#" target="_blank" aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" target="_blank" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" target="_blank" aria-label="LinkedIn"><FaLinkedinIn /></a>
                <a href="#" target="_blank" aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN NAVBAR */}
        <div className={styles.mainNavbar}>
          <div className="container">
            <div className={styles.navbar}>

              {/* Logo */}
              <div className={styles.logo}>
                <Link href="/">
                  <Image src={logo} alt="TECHNOMAC Logo" height={40} width={150} />
                </Link>
              </div>

              {/* Nav Menu */}
              <nav className={`${styles.navMenu} ${menuOpen ? styles.active : ""}`}>

                {/* Mobile Search Bar inside Drawer */}
                <div className={styles.mobileSearchWrapper} ref={mobileSearchRef}>
                  <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim()) setShowDropdown(true);
                      }}
                      className={styles.mobileSearchInput}
                    />
                    <button type="submit" className={styles.mobileSearchBtn} aria-label="Search">
                      <FaSearch />
                    </button>
                  </form>
                </div>

                <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>

                {/* MEGA MENU */}
                <div className={styles.megaMenuWrapper}>
                  <Link href="/products" onClick={handleProductsClick}>
                    <span className={styles.menuTitle}>
                      Products{" "}
                      <FaChevronDown
                        className={`${styles.arrowIcon} ${
                          mobileProductsOpen ? styles.mobileTitleArrowOpen : ""
                        }`}
                      />
                    </span>
                  </Link>

                  {/* DESKTOP HOVER MEGA MENU — unchanged */}
                  <div className={styles.megaMenu}>
                    {/* LEFT — CATEGORIES */}
                    <div className={styles.categoryList}>
                      {loadingCategories ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={styles.categoryItemSkeleton} />
                        ))
                      ) : (
                        categories.map((item) => (
                          <div
                            key={item._id}
                            className={`${styles.categoryItem} ${activeCategory?._id === item._id ? styles.activeCategory : ""}`}
                            onMouseEnter={() => setActiveCategory(item)}
                          >
                            {item.name || item.title || item.categoryName}
                          </div>
                        ))
                      )}
                    </div>

                    {/* RIGHT — SUBCATEGORIES */}
                    <div className={styles.productList}>
                      {activeCategory && (
                        <h4>{activeCategory.name || activeCategory.title}</h4>
                      )}

                      <div className={styles.productGrid}>
                        {loadingSubCategories ? (
                          <div style={{ gridColumn: "1 / -1", padding: "20px 0" }}>
                            <AttractiveLoader size="sm" text="Loading categories..." />
                          </div>
                        ) : subCategories.length > 0 ? (
                          subCategories.map((sub) => (
                            <Link
                              href={`/products?category=${toSlug(sub.name)}`}
                              key={sub._id}
                              onClick={() => setMenuOpen(false)}
                            >
                              {sub.name || sub.title || sub.subCategoryName}
                            </Link>
                          ))
                        ) : (
                          !loadingSubCategories && (
                            <p className={styles.noProducts}>No subcategories found</p>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MOBILE PRODUCTS ACCORDION — Category → Subcategory */}
                  {mobileProductsOpen && (
                    <div className={styles.mobileMegaMenu}>
                      {loadingCategories ? (
                        <div className={styles.mobileLoading}>Loading categories...</div>
                      ) : (
                        categories.map((item) => {
                          const catId = item._id;
                          const catName = item.name || item.title || item.categoryName;
                          const catSubs = subCategoryCache[catId];
                          const isExpanded = mobileExpandedCategory === catId;

                          return (
                            <div key={catId} className={styles.mobileCategoryItem}>
                              <div
                                className={styles.mobileCategoryRow}
                                onClick={() => handleMobileCategoryClick(item)}
                              >
                                <span>{catName}</span>

                                {catSubs === undefined ? (
                                  <FaSpinner className={styles.spinnerIcon} />
                                ) : catSubs.length > 0 ? (
                                  <FaChevronDown
                                    className={`${styles.mobileCatArrow} ${
                                      isExpanded ? styles.mobileCatArrowOpen : ""
                                    }`}
                                  />
                                ) : null}
                              </div>

                              {isExpanded && catSubs && catSubs.length > 0 && (
                                <div className={styles.mobileSubCategoryList}>
                                  {catSubs.map((sub) => (
                                    <Link
                                      key={sub._id}
                                      href={`/products?category=${toSlug(sub.name)}`}
                                      onClick={() => setMenuOpen(false)}
                                      className={styles.mobileSubCategoryLink}
                                    >
                                      {sub.name || sub.title || sub.subCategoryName}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <Link href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</Link>
                <Link href="/clinic-setup" onClick={() => setMenuOpen(false)}>Clinic Setup</Link>
                <Link href="/updates" onClick={() => setMenuOpen(false)}>New Updates</Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>

                {/* MOBILE ACTION BUTTONS */}
                <div className={styles.mobileActionsWrapper}>
                  <Link
                    href="/warranty-registration"
                    onClick={() => setMenuOpen(false)}
                    className={styles.mobileWarrantyBtn}
                  >
                    Extend Warranty
                  </Link>
                  <a
                    href="https://razorpay.me/@technomacmedicalsystemspvtltd"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className={styles.mobilePayBtn}
                  >
                    Pay Now
                  </a>
                </div>

                <button className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <FaTimes />
                </button>
              </nav>

              {/* Right Section */}
              <div className={styles.rightSection}>

                {/* SEARCH BAR (Desktop) */}
                <div className={styles.searchWrapper} ref={searchRef}>
                  <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim()) setShowDropdown(true);
                      }}
                      className={styles.searchInput}
                      aria-label="Search all products"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setShowDropdown(false);
                        }}
                        aria-label="Clear search"
                      >
                        <FaTimes />
                      </button>
                    )}
                    {searchLoading && <FaSpinner className={styles.spinnerIcon} />}
                  </form>

                  {/* LIVE SEARCH DROPDOWN */}
                  {showDropdown && searchQuery.trim().length > 0 && (
                    <div className={styles.searchDropdown}>
                      <div className={styles.dropdownHeader}>
                        <span>
                          {searchLoading
                            ? "Searching products..."
                            : searchResults.length > 0
                            ? `Found ${searchResults.length} product${searchResults.length === 1 ? "" : "s"}`
                            : "No exact matches"}
                        </span>
                      </div>

                      <div className={styles.dropdownResultsList}>
                        {searchResults.length > 0 ? (
                          searchResults.map((item) => (
                            <div
                              key={item._id}
                              className={styles.dropdownItem}
                              onClick={() => handleProductSelect(item)}
                            >
                              <div className={styles.dropdownItemImgWrapper}>
                                <Image
                                  src={
                                    item.image ||
                                    (Array.isArray(item.images) && item.images[0]) ||
                                    logo
                                  }
                                  alt={item.name}
                                  width={44}
                                  height={44}
                                  className={styles.dropdownItemImg}
                                />
                              </div>
                              <div className={styles.dropdownItemInfo}>
                                <h5 className={styles.dropdownItemTitle}>{item.name}</h5>
                                <div className={styles.dropdownItemMeta}>
                                  {item.category?.name && (
                                    <span className={styles.dropdownCategoryBadge}>
                                      {item.category.name}
                                    </span>
                                  )}
                                  {item.sku && (
                                    <span className={styles.dropdownSku}>
                                      SKU: {item.sku}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={styles.dropdownArrow}>↗</span>
                            </div>
                          ))
                        ) : (
                          !searchLoading && (
                            <div className={styles.noResultsBox}>
                              <p>No products found for "<strong>{searchQuery}</strong>"</p>
                              <span>Try searching dental chair, x-ray, autoclave, etc.</span>
                            </div>
                          )
                        )}
                      </div>

                      <div className={styles.dropdownFooter} onClick={handleViewAllResults}>
                        <span>View all matching products for "{searchQuery}"</span>
                        <span className={styles.viewAllArrow}>→</span>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/warranty-registration">
                  <button className={styles.warrantyBtn}>Extend Warranty</button>
                </Link>
                <a href="https://razorpay.me/@technomacmedicalsystemspvtltd">
                  <button className={styles.quoteBtn}>Pay Now</button>
                </a>

                <button className={styles.mobileBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu">
                  <FaBars />
                </button>
              </div>

            </div>
          </div>
        </div>

      </header>

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}

// import Link from "next/link";
// import Image from "next/image";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/router";
// import styles from "./Header.module.css";
// import logo from "../../../../Images/logo-chat.png";
// import { getData } from "../../../services/FetchNodeServices";
// import AttractiveLoader from "../../common/Loader/AttractiveLoader";
// import { FaBars, FaTimes, FaPhoneAlt, FaEnvelope, FaChevronDown, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaSearch, FaSpinner} from "react-icons/fa";

// export default function Header() {
//   const router = useRouter();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [sticky, setSticky] = useState(false);

//   const [categories, setCategories] = useState([]);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [subCategories, setSubCategories] = useState([]);
//   const [subCategoryCache, setSubCategoryCache] = useState({});
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingSubCategories, setLoadingSubCategories] = useState(false);

//   // ─── Search States ─────────────────────────────────────────────────────────
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const searchRef = useRef(null);
//   const mobileSearchRef = useRef(null);

//   const [contactInfo, setContactInfo] = useState({
//     salesPhone: "",
//     servicePhone: "",
//     email: "",
//     address: "",
//     whatsappPhone: "",
//   });

//   const toSlug = (text) => {
//     if (!text) return "";
//     return text
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, "")
//       .replace(/[\s_-]+/g, "-")
//       .replace(/^-+|-+$/g, "");
//   };

//   // ─── 1. Fetch Contact Info ──────────────────────────────────────────────────
//   useEffect(() => {
//     const fetchContactInfo = async () => {
//       try {
//         const res = await getData("contact-info");
//         if (res?.success && res?.data) {
//           setContactInfo({
//             salesPhone: res.data.salesPhone || "",
//             servicePhone: res.data.servicePhone || "+91 9311125574",
//             email: res.data.email || "info@technomac.in",
//             address: res.data.address || "",
//             whatsappPhone: res.data.whatsappPhone || "+919311125574",
//           });
//         }
//       } catch (err) {
//         console.error("fetchContactInfo error:", err);
//       }
//     };
//     fetchContactInfo();
//   }, []);

//   // ─── 2. Fetch all parent categories on mount ────────────────────────────────
//   useEffect(() => {
//     const fetchAllCategory = async () => {
//       try {
//         const response = await getData("parentCategory/all");
//         if (response?.success === true && Array.isArray(response.data)) {
//           setCategories(response.data);
//           if (response.data.length > 0) {
//             setActiveCategory(response.data[0]);
//           }
//         }
//       } catch (e) {
//         console.error("Category fetch failed:", e?.message);
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     fetchAllCategory();
//   }, []);

//   // ─── 3. Fetch subcategories when activeCategory changes ────────────────────
//   useEffect(() => {
//     if (!activeCategory?._id) return;
//     const categoryId = activeCategory._id;

//     if (subCategoryCache[categoryId]) {
//       setSubCategories(subCategoryCache[categoryId]);
//       return;
//     }

//     const fetchSubCategories = async () => {
//       setLoadingSubCategories(true);
//       try {
//         const response = await getData(`category/by-parent/${categoryId}`);
//         if (response?.success === true && Array.isArray(response.data)) {
//           setSubCategories(response.data);
//           setSubCategoryCache((prev) => ({
//             ...prev,
//             [categoryId]: response.data,
//           }));
//         } else {
//           setSubCategories([]);
//         }
//       } catch (e) {
//         console.error("SubCategory fetch failed:", e?.message);
//         setSubCategories([]);
//       } finally {
//         setLoadingSubCategories(false);
//       }
//     };

//     fetchSubCategories();
//   }, [activeCategory?._id]);

//   // ─── 4. Sticky Navbar on Scroll ────────────────────────────────────────────
//   useEffect(() => {
//     const handleScroll = () => setSticky(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // ─── 5. Live Search Debounce ───────────────────────────────────────────────
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setSearchResults([]);
//       setSearchLoading(false);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       setSearchLoading(true);
//       try {
//         const res = await getData(`product/search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
//         if (res?.success && Array.isArray(res.data)) {
//           setSearchResults(res.data);
//         } else {
//           setSearchResults([]);
//         }
//       } catch (err) {
//         console.error("Live search error:", err);
//         setSearchResults([]);
//       } finally {
//         setSearchLoading(false);
//       }
//     }, 250);

//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   // ─── 6. Close dropdown on outside click or Escape key ──────────────────────
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       const isOutsideDesktop = searchRef.current && !searchRef.current.contains(e.target);
//       const isOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(e.target);
//       if (isOutsideDesktop && isOutsideMobile) {
//         setShowDropdown(false);
//       }
//     };

//     const handleKeyDown = (e) => {
//       if (e.key === "Escape") {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   // ─── Submit Search Form (Enter or search button) ───────────────────────────
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       setShowDropdown(false);
//       setMenuOpen(false);
//       router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
//     }
//   };

//   // ─── Click Single Product in Dropdown ──────────────────────────────────────
//   const handleProductSelect = (product) => {
//     setShowDropdown(false);
//     setSearchQuery("");
//     setMenuOpen(false);
//     const targetSlug = product?.slug || toSlug(product?.name) || product?._id;
//     router.push(`/product/${targetSlug}`);
//   };

//   // ─── View All Results ───────────────────────────────────────────────────────
//   const handleViewAllResults = () => {
//     setShowDropdown(false);
//     setMenuOpen(false);
//     router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
//   };

//   return (
//     <>
//       <header className={`${styles.header} ${sticky ? styles.sticky : ""}`}>

//         {/* TOP HEADER */}
//         <div className={styles.topHeader}>
//           <div className="container">
//             <div className={styles.topHeaderWrapper}>
//               <div className={styles.topLeft}>
//                 {contactInfo?.servicePhone && (
//                   <a href={`tel:${contactInfo.servicePhone.replace(/[^\d+]/g, "")}`}>
//                     <FaPhoneAlt /> {contactInfo.servicePhone}
//                   </a>
//                 )}
//                 {contactInfo?.email && (
//                   <a href={`mailto:${contactInfo.email}`}>
//                     <FaEnvelope /> {contactInfo.email}
//                   </a>
//                 )}
//               </div>
//               <div className={styles.topRight}>
//                 <a href="#" target="_blank" aria-label="Facebook"><FaFacebookF /></a>
//                 <a href="#" target="_blank" aria-label="Instagram"><FaInstagram /></a>
//                 <a href="#" target="_blank" aria-label="LinkedIn"><FaLinkedinIn /></a>
//                 <a href="#" target="_blank" aria-label="YouTube"><FaYoutube /></a>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* MAIN NAVBAR */}
//         <div className={styles.mainNavbar}>
//           <div className="container">
//             <div className={styles.navbar}>

//               {/* Logo */}
//               <div className={styles.logo}>
//                 <Link href="/">
//                   <Image src={logo} alt="TECHNOMAC Logo" height={40} width={150} />
//                 </Link>
//               </div>

//               {/* Nav Menu */}
//               <nav className={`${styles.navMenu} ${menuOpen ? styles.active : ""}`}>

//                 {/* Mobile Search Bar inside Drawer */}
//                 <div className={styles.mobileSearchWrapper} ref={mobileSearchRef}>
//                   <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
//                     <input
//                       type="text"
//                       placeholder="Search products..."
//                       value={searchQuery}
//                       onChange={(e) => {
//                         setSearchQuery(e.target.value);
//                         setShowDropdown(true);
//                       }}
//                       onFocus={() => {
//                         if (searchQuery.trim()) setShowDropdown(true);
//                       }}
//                       className={styles.mobileSearchInput}
//                     />
//                     <button type="submit" className={styles.mobileSearchBtn} aria-label="Search">
//                       <FaSearch />
//                     </button>
//                   </form>
//                 </div>

//                 <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>

//                 {/* MEGA MENU */}
//                 <div className={styles.megaMenuWrapper}>
//                   <Link href="/products" onClick={() => setMenuOpen(false)}>
//                     <span className={styles.menuTitle}>
//                       Products <FaChevronDown className={styles.arrowIcon} />
//                     </span>
//                   </Link>

//                   <div className={styles.megaMenu}>
//                     {/* LEFT — CATEGORIES */}
//                     <div className={styles.categoryList}>
//                       {loadingCategories ? (
//                         Array.from({ length: 5 }).map((_, i) => (
//                           <div key={i} className={styles.categoryItemSkeleton} />
//                         ))
//                       ) : (
//                         categories.map((item) => (
//                           <div
//                             key={item._id}
//                             className={`${styles.categoryItem} ${activeCategory?._id === item._id ? styles.activeCategory : ""}`}
//                             onMouseEnter={() => setActiveCategory(item)}
//                           >
//                             {item.name || item.title || item.categoryName}
//                           </div>
//                         ))
//                       )}
//                     </div>

//                     {/* RIGHT — SUBCATEGORIES */}
//                     <div className={styles.productList}>
//                       {activeCategory && (
//                         <h4>{activeCategory.name || activeCategory.title}</h4>
//                       )}

//                       <div className={styles.productGrid}>
//                         {loadingSubCategories ? (
//                           <div style={{ gridColumn: "1 / -1", padding: "20px 0" }}>
//                             <AttractiveLoader size="sm" text="Loading categories..." />
//                           </div>
//                         ) : subCategories.length > 0 ? (
//                           subCategories.map((sub) => (
//                             <Link
//                               href={`/products?category=${toSlug(sub.name)}`}
//                               key={sub._id}
//                               onClick={() => setMenuOpen(false)}
//                             >
//                               {sub.name || sub.title || sub.subCategoryName}
//                             </Link>
//                           ))
//                         ) : (
//                           !loadingSubCategories && (
//                             <p className={styles.noProducts}>No subcategories found</p>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <Link href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</Link>
//                 <Link href="/clinic-setup" onClick={() => setMenuOpen(false)}>Clinic Setup</Link>
//                 <Link href="/updates" onClick={() => setMenuOpen(false)}>New Updates</Link>
//                 <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>

//                 <button className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu">
//                   <FaTimes />
//                 </button>
//               </nav>

//               {/* Right Section */}
//               <div className={styles.rightSection}>

//                 {/* SEARCH BAR (Desktop) */}
//                 <div className={styles.searchWrapper} ref={searchRef}>
//                   <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
//                     <FaSearch className={styles.searchIcon} />
//                     <input
//                       type="text"
//                       placeholder="Search products..."
//                       value={searchQuery}
//                       onChange={(e) => {
//                         setSearchQuery(e.target.value);
//                         setShowDropdown(true);
//                       }}
//                       onFocus={() => {
//                         if (searchQuery.trim()) setShowDropdown(true);
//                       }}
//                       className={styles.searchInput}
//                       aria-label="Search all products"
//                     />
//                     {searchQuery && (
//                       <button
//                         type="button"
//                         className={styles.clearBtn}
//                         onClick={() => {
//                           setSearchQuery("");
//                           setSearchResults([]);
//                           setShowDropdown(false);
//                         }}
//                         aria-label="Clear search"
//                       >
//                         <FaTimes />
//                       </button>
//                     )}
//                     {searchLoading && <FaSpinner className={styles.spinnerIcon} />}
//                   </form>

//                   {/* LIVE SEARCH DROPDOWN */}
//                   {showDropdown && searchQuery.trim().length > 0 && (
//                     <div className={styles.searchDropdown}>
//                       <div className={styles.dropdownHeader}>
//                         <span>
//                           {searchLoading
//                             ? "Searching products..."
//                             : searchResults.length > 0
//                             ? `Found ${searchResults.length} product${searchResults.length === 1 ? "" : "s"}`
//                             : "No exact matches"}
//                         </span>
//                       </div>

//                       <div className={styles.dropdownResultsList}>
//                         {searchResults.length > 0 ? (
//                           searchResults.map((item) => (
//                             <div
//                               key={item._id}
//                               className={styles.dropdownItem}
//                               onClick={() => handleProductSelect(item)}
//                             >
//                               <div className={styles.dropdownItemImgWrapper}>
//                                 <Image
//                                   src={
//                                     item.image ||
//                                     (Array.isArray(item.images) && item.images[0]) ||
//                                     logo
//                                   }
//                                   alt={item.name}
//                                   width={44}
//                                   height={44}
//                                   className={styles.dropdownItemImg}
//                                 />
//                               </div>
//                               <div className={styles.dropdownItemInfo}>
//                                 <h5 className={styles.dropdownItemTitle}>{item.name}</h5>
//                                 <div className={styles.dropdownItemMeta}>
//                                   {item.category?.name && (
//                                     <span className={styles.dropdownCategoryBadge}>
//                                       {item.category.name}
//                                     </span>
//                                   )}
//                                   {item.sku && (
//                                     <span className={styles.dropdownSku}>
//                                       SKU: {item.sku}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                               <span className={styles.dropdownArrow}>↗</span>
//                             </div>
//                           ))
//                         ) : (
//                           !searchLoading && (
//                             <div className={styles.noResultsBox}>
//                               <p>No products found for "<strong>{searchQuery}</strong>"</p>
//                               <span>Try searching dental chair, x-ray, autoclave, etc.</span>
//                             </div>
//                           )
//                         )}
//                       </div>

//                       <div className={styles.dropdownFooter} onClick={handleViewAllResults}>
//                         <span>View all matching products for "{searchQuery}"</span>
//                         <span className={styles.viewAllArrow}>→</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <Link href="/warranty-registration">
//                   <button className={styles.warrantyBtn}>Extend Warranty</button>
//                 </Link>
//                 <a href="https://razorpay.me/@technomacmedicalsystemspvtltd">
//                   <button className={styles.quoteBtn}>Pay Now</button>
//                 </a>

//                 <button className={styles.mobileBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu">
//                   <FaBars />
//                 </button>
//               </div>

//             </div>
//           </div>
//         </div>

//       </header>

//       {menuOpen && (
//         <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
//       )}
//     </>
//   );
// }