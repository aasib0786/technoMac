// import Link from "next/link";
// import { useState, useEffect } from "react";
// import {
//   FaBars,
//   FaTimes,
//   FaPhoneAlt,
//   FaEnvelope,
//   FaChevronDown,
//   FaFacebookF,
//   FaInstagram,
//   FaLinkedinIn,
//   FaYoutube,
// } from "react-icons/fa";

// import styles from "./Header.module.css";
// import logo from "../../../../Images/logo-chat.png";
// import Image from "next/image";
// // import menuData from "../../../Data/menuData";
// import menuData from "../../../../Data/menuData";


// export default function Header() {
//   const [mobileProductOpen, setMobileProductOpen] =
//     useState(false);

//   const [menuOpen, setMenuOpen] = useState(false);

//   const [sticky, setSticky] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(menuData[0]);
//   const [category, setCategory] = useState([])
//    const [subCategory, setSubCategory] = useState([])
//   const [loading, setLoading] = useState(false)

//   const fetchAllCategory = async () => {
//     try {
//       // ✅ Remove leading slash — getData likely prepends serverURL + "/"
//       const response = await getData("category/");
//       console.log("categoryResponse=>", response)
//       if (response.success === true) {
//         // console.log("SSSS==>response", category)
//         // ✅ Map API response to the shape our UI expects
//         const mapped = response.data.map((item) => ({
//           image: item.imageUrl || item.image || item.category_image,
//           name: item.title || item.name || "",
//           desc: item.desc || item.description || item.subtitle || "",
//           isRemote: item.isActive || true, // flag to use <img> instead of next/image for remote URLs
//         }));
//         setActiveCategory(response.data[0])
//         setCategory(mapped);
//       }
//       // If empty or null → keep static fallback already in state
//     } catch (e) {
//       console.error("Category fetch failed, using static fallback:", e?.message);
//       // ✅ Static Category already set as default — nothing extra needed
//     } finally {
//       setLoading(false);
//     }
//   };

//     const fetchAllSubCategory = async () => {
//     try {
//       const response = await getData(`sub-category/by-category/${activeCategory}`);
//       console.log("categoryResponse=>", response)
//       if (response.success === true) {
//         // console.log("SSSS==>response", category)
//         // ✅ Map API response to the shape our UI expects
//         const mapped = response.data.map((item) => ({
//           image: item.imageUrl || item.image || item.category_image,
//           name: item.title || item.name || "",
//           desc: item.desc || item.description || item.subtitle || "",
//           isRemote: item.isActive || true, // flag to use <img> instead of next/image for remote URLs
//         }));
//         setSubCategory(mapped);
//       }
//       // If empty or null → keep static fallback already in state
//     } catch (e) {
//       console.error("Category fetch failed, using static fallback:", e?.message);
//       // ✅ Static Category already set as default — nothing extra needed
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ useEffect instead of useState
//   useEffect(() => {
//     fetchAllCategory();
//     fetchAllSubCategory()
//   }, [activeCategory]);
//   // console.log("SSSS==>response", category)

//   useEffect(() => {

//     const handleScroll = () => {
//       setSticky(window.scrollY > 20);
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () =>
//       window.removeEventListener("scroll", handleScroll);

//   }, []);

//   return (
//     <>
//       <header
//         className={`${styles.header} ${sticky ? styles.sticky : ""
//           }`}
//       >

//         {/* TOP HEADER */}

//         <div className={styles.topHeader}>

//           <div className="container">

//             <div className={styles.topHeaderWrapper}>

//               {/* Left */}

//               <div className={styles.topLeft}>

//                 <a href="tel:+919311125574">

//                   <FaPhoneAlt />

//                   +91 9311125574

//                 </a>

//                 <a href="mailto:info@Technomac.com">

//                   <FaEnvelope />

//                   info@Technomac.com

//                 </a>

//               </div>

//               {/* Right */}

//               <div className={styles.topRight}>

//                 <a href="#" target="_blank">
//                   <FaFacebookF />
//                 </a>

//                 <a href="#" target="_blank">
//                   <FaInstagram />
//                 </a>

//                 <a href="#" target="_blank">
//                   <FaLinkedinIn />
//                 </a>

//                 <a href="#" target="_blank">
//                   <FaYoutube />
//                 </a>

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
//                   <Image src={logo} alt="TECHNOMAC Logo" height={50} width={150} />
//                 </Link>

//               </div>

//               {/* Menu */}

//               <nav
//                 className={`${styles.navMenu} ${menuOpen ? styles.active : ""
//                   }`}
//               >

//                 <Link href="/">Home</Link>
//                 {/* <Link href="/about">
//                   About
//                 </Link> */}
//                 <div className={styles.megaMenuWrapper}>
//                   <Link href="/products">
//                     <span className={styles.menuTitle}>

//                       Products
//                       <FaChevronDown className={styles.arrowIcon} />
//                     </span>
//                   </Link>

//                   {/* MEGA MENU */}

//                   <div className={styles.megaMenu}>

//                     {/* LEFT CATEGORY */}

//                     <div className={styles.categoryList}>

//                       {category.map((item, index) => (

//                         <div
//                           key={index}
//                           className={`${styles.categoryItem}
//                                     ${activeCategory.category._id === item._id
//                               ? styles.activeCategory
//                               : ""
//                             }`}
//                           onMouseEnter={() =>
//                             setActiveCategory(item)
//                           }
//                         >

//                           {item.name}

//                         </div>

//                       ))}

//                     </div>

//                     {/* RIGHT PRODUCTS */}

//                     <div className={styles.productList}>

//                       <h4>
//                         {activeCategory.category}
//                       </h4>

//                       <div className={styles.productGrid}>

//                         {activeCategory.products.map(
//                           (product, index) => (

//                             <Link href="/products"
//                               key={index}
//                             >

//                               {product}

//                             </Link>

//                           )
//                         )}

//                       </div>

//                     </div>

//                   </div>

//                 </div>

//                 <Link href="/certificates">
//                   Certificates
//                 </Link>
//                 <Link href="/catalogue">
//                   Catalogue
//                 </Link>
//                 <Link href="/clinic-setup">
//                   Clinic Setup
//                 </Link>

//                 {/* <Link href="/blogs">
//                   Blogs
//                 </Link> */}
//                 <Link href="/updates">
//                   New Updates
//                 </Link>

//                 <Link href="/contact">
//                   Contact Us
//                 </Link>

//                 {/* <Link href="/e-library">
//                   e-Library
//                 </Link> */}

//                 <button
//                   className={styles.closeBtn}
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   <FaTimes />
//                 </button>

//               </nav>

//               {/* Right Section */}

//               <div className={styles.rightSection}>

//                 <Link href="/warranty-registration">

//                   <button className={styles.warrantyBtn}>

//                     Extend Warranty

//                   </button>

//                 </Link>

//                 <button className={styles.quoteBtn}>
//                   Pay Now
//                 </button>

//                 <button
//                   className={styles.mobileBtn}
//                   onClick={() => setMenuOpen(true)}
//                 >
//                   <FaBars />
//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>

//       </header>

//       {/* Overlay */}

//       {menuOpen && (
//         <div
//           className={styles.overlay}
//           onClick={() => setMenuOpen(false)}
//         ></div>
//       )}
//     </>
//   );
// }

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaBars, FaTimes, FaPhoneAlt, FaEnvelope, FaChevronDown,
  FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube,
} from "react-icons/fa";
import styles from "./Header.module.css";
import logo from "../../../../Images/logo-chat.png";
import Image from "next/image";
import { getData } from "../../../services/FetchNodeServices"; // ✅ ADDED

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  const [categories, setCategories] = useState([]);       // all categories from API
  const [activeCategory, setActiveCategory] = useState(null); // currently hovered category object
  const [subCategories, setSubCategories] = useState([]); // subcategories of active category

  // ✅ Cache: { [categoryId]: [subCategory, ...] } — avoids re-fetching on re-hover
  const [subCategoryCache, setSubCategoryCache] = useState({});

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // ─── 1. Fetch all categories once on mount ──────────────────────────────────
  useEffect(() => {
    const fetchAllCategory = async () => {
      try {
        const response = await getData("parentCategory/all");
        console.log("categoryResponse=>", response);

        if (response?.success === true && Array.isArray(response.data)) {
          setCategories(response.data);

          // Set first category as default active
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
  }, []); // ✅ empty deps — runs once only

  // ─── 2. Fetch subcategories when activeCategory changes ────────────────────
  useEffect(() => {
    if (!activeCategory?._id) return;

    const categoryId = activeCategory._id;

    // ✅ Use cache if already fetched
    if (subCategoryCache[categoryId]) {
      setSubCategories(subCategoryCache[categoryId]);
      return;
    }

    const fetchSubCategories = async () => {
      setLoadingSubCategories(true);
      try {
        const response = await getData(`category/by-parent/${categoryId}`);
        console.log("subCategoryResponse=>", response);

        if (response?.success === true && Array.isArray(response.data)) {
          setSubCategories(response.data);

          // ✅ Save to cache
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
  }, [activeCategory?._id]); // ✅ only re-runs when category ID changes

  // ─── 3. Sticky scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${sticky ? styles.sticky : ""}`}>

        {/* TOP HEADER */}
        <div className={styles.topHeader}>
          <div className="container">
            <div className={styles.topHeaderWrapper}>
              <div className={styles.topLeft}>
                <a href="tel:+919311125574"><FaPhoneAlt /> +91 9311125574</a>
                <a href="mailto:info@Technomac.com"><FaEnvelope /> info@Technomac.com</a>
              </div>
              <div className={styles.topRight}>
                <a href="#" target="_blank"><FaFacebookF /></a>
                <a href="#" target="_blank"><FaInstagram /></a>
                <a href="#" target="_blank"><FaLinkedinIn /></a>
                <a href="#" target="_blank"><FaYoutube /></a>
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
                <Link href="/">Home</Link>

                {/* MEGA MENU */}
                <div className={styles.megaMenuWrapper}>
                  <Link href="/products">
                    <span className={styles.menuTitle}>
                      Products <FaChevronDown className={styles.arrowIcon} />
                    </span>
                  </Link>

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
                            className={`${styles.categoryItem} ${activeCategory?._id === item._id
                                ? styles.activeCategory
                                : ""
                              }`}
                            onMouseEnter={() => setActiveCategory(item)}
                          >
                            {/* ✅ use correct field — adjust if your API returns different name */}
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
                          <p className={styles.loadingText}>Loading...</p>
                        ) : subCategories.length > 0 ? (
                          subCategories.map((sub) => (
                            <Link
                              // category=${activeCategory?._id}&
                              href={`/products?category=${sub._id}`}
                              key={sub._id}
                            >
                              {/* ✅ adjust field name to match your API */}
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
                </div>

                {/* <Link href="/certificates">Certificates</Link> */}
                <Link href="/catalogue">Catalogue</Link>
                <Link href="/clinic-setup">Clinic Setup</Link>
                <Link href="/updates">New Updates</Link>
                <Link href="/contact">Contact Us</Link>

                <button className={styles.closeBtn} onClick={() => setMenuOpen(false)}>
                  <FaTimes />
                </button>
              </nav>

              {/* Right Section */}
              <div className={styles.rightSection}>
                <Link href="/warranty-registration">
                  <button className={styles.warrantyBtn}>Extend Warranty</button>
                </Link>
                <a href="https://razorpay.me/@technomacmedicalsystemspvtltd">
                  <button className={styles.quoteBtn}>Pay Now</button>
                </a>

                <button className={styles.mobileBtn} onClick={() => setMenuOpen(true)}>
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