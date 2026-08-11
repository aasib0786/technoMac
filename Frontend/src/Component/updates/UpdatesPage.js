import Link from "next/link";
import Image from "next/image";
import updates from "../../../Data/updates";
import styles from "./UpdatesPage.module.css";
import { FaArrowRight, FaClock, FaCalendarAlt, } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getData } from "../../services/FetchNodeServices";
import Breadcrumb from "../common/Breadcrumb/Breadcrumb";

import { optimizeImageUrl } from "../../utils/imageOptimizer";

import SkeletonLoader from "../common/Loader/SkeletonLoader";

export default function UpdatesPage() {
  const [update, setUpdate] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAllNewUpdate = async () => {
    try {
      setLoading(true);
      const response = await getData("newupdate/all");
      if (response?.success === true && Array.isArray(response?.data)) {
        const mapped = response.data.map((item) => ({
          ...item,
          image: optimizeImageUrl(item.image, { width: 500 }),
        }));
        setUpdate(mapped);
      }
    } catch (e) {
      console.error("Updates fetch failed:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNewUpdate();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className={styles.updateSection}>
      {/* GLOW */}
      <div className={styles.glow}></div>

      <div className="container">
        <Breadcrumb pageName="Updates" />

        {/* TOP */}
        <div className={styles.heading}>
          <h1>
            Latest Updates &
            Healthcare News
          </h1>

          <p>
            Discover the latest product launches,
            medical and dental innovations, and
            healthcare technology trends from Technomac Medical Systems.
          </p>
        </div>

        {/* GRID */}
        {loading && update.length === 0 ? (
          <SkeletonLoader type="update" count={8} />
        ) : (
          <div className="row">

          {update.map((item) => (

            <div
              className="col-lg-3 col-md-6 mb-4"
              key={item.id}
            >

              <Link
                href={`/updates/${item.subTitle}`}
                className={styles.card}
              >

                {/* IMAGE */}

                <div className={styles.imageWrapper}>

                  <Image
                    src={item.image}
                    alt={item.title}
                    width={220}
                    height={220}
                    className={styles.image}
                  />

                  {/* OVERLAY */}

                  <div className={styles.overlay}></div>

                  {/* DATE */}

                  <div className={styles.dateBox}>

                    <FaCalendarAlt />

                    {formatDate(item.createdAt)}

                  </div>

                </div>

                {/* CONTENT */}

                <div className={styles.content}>

                  {/* TIME */}

                  <div className={styles.time}>

                    <FaClock />

                    5 Min Read

                  </div>

                  {/* TITLE */}

                  <h3>
                    {item.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p>
                    {item.description.slice(0, 90)}...
                  </p>

                  {/* BUTTON */}

                  <div className={styles.readMore}>

                    Read Full Update

                    <FaArrowRight />

                  </div>

                </div>

              </Link>

            </div>

          ))}

        </div>
        )}

      </div>

    </section>
  );
}

// import Link from "next/link";
// import Image from "next/image";
// import styles from "./UpdatesPage.module.css";
// import { FaArrowRight, FaClock, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
// import { useEffect, useState } from "react";
// import { getData } from "../../services/FetchNodeServices";

// export default function UpdatesPage() {
//   const [updates, setUpdates] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchAllNewUpdate = async () => {
//     setLoading(true);
//     try {
//       const response = await getData("newupdate/all");
//       if (response?.success === true) {
//         setUpdates(response.data);
//       }
//     } catch (e) {
//       console.error("Updates fetch failed:", e?.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllNewUpdate();
//   }, []);

//   const formatDate = (dateStr) =>
//     new Date(dateStr).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });

//   // Skeleton cards shown while loading
//   if (loading) {
//     return (
//       <section className={styles.updateSection}>
//         <div className={styles.glow}></div>
//         <div className="container">
//           <div className={styles.heading}>
//             <span>TECHNOMAC NEWS</span>
//             <h1>Latest Updates & Healthcare News</h1>
//             <p>
//               Explore the latest innovations, product launches and modern
//               healthcare technology updates from TECHNOMAC.
//             </p>
//           </div>
//           <div className="row">
//             {[1, 2, 3].map((i) => (
//               <div className="col-lg-4 col-md-6 mb-4" key={i}>
//                 <div className={styles.skeleton}></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (!loading && updates.length === 0) {
//     return (
//       <section className={styles.updateSection}>
//         <div className={styles.glow}></div>
//         <div className="container">
//           <div className={styles.heading}>
//             <span>TECHNOMAC NEWS</span>
//             <h1>Latest Updates & Healthcare News</h1>
//           </div>
//           <div className={styles.emptyState}>
//             <p>No updates available at the moment. Check back soon!</p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   // First item is featured (hero), rest are normal cards
//   const [featured, ...rest] = updates;

//   return (
//     <section className={styles.updateSection}>
//       <div className={styles.glow}></div>

//       <div className="container">

//         {/* TOP */}
//         <div className={styles.heading}>
//           <span>TECHNOMAC NEWS</span>
//           <h1>Latest Updates & Healthcare News</h1>
//           <p>
//             Explore the latest innovations, product launches and modern
//             healthcare technology updates from TECHNOMAC.
//           </p>
//         </div>

//         {/* ── FEATURED CARD (first item, full-width) ── */}
//         <Link
//           href={`/updates/${featured._id}`}
//           className={styles.featuredCard}
//         >
//           <div className={styles.featuredImageWrapper}>
//             <Image
//               src={featured.image}
//               alt={featured.title}
//               fill
//               className={styles.featuredImage}
//             />
//             <div className={styles.overlay}></div>
//             <span className={styles.featuredBadge}>Featured</span>
//           </div>

//           <div className={styles.featuredContent}>
//             <div className={styles.meta}>
//               <span><FaCalendarAlt /> {formatDate(featured.createdAt)}</span>
//               <span><FaClock /> 5 Min Read</span>
//             </div>

//             <h2>{featured.title}</h2>
//             <p>{featured.description}</p>

//             {/* Points */}
//             {featured.points?.length > 0 && (
//               <ul className={styles.pointsList}>
//                 {featured.points.slice(0, 3).map((pt, i) => (
//                   <li key={i}>
//                     <FaCheckCircle className={styles.checkIcon} />
//                     {pt}
//                   </li>
//                 ))}
//               </ul>
//             )}

//             <div className={styles.readMore}>
//               Read Full Update <FaArrowRight />
//             </div>
//           </div>
//         </Link>

//         {/* ── GRID CARDS (remaining items) ── */}
//         {rest.length > 0 && (
//           <div className="row mt-4">
//             {rest.map((item) => (
//               <div className="col-lg-4 col-md-6 mb-4" key={item._id}>
//                 <Link
//                   href={`/updates/${item._id}`}
//                   className={styles.card}
//                 >
//                   {/* IMAGE */}
//                   <div className={styles.imageWrapper}>
//                     <Image
//                       src={item.image}
//                       alt={item.title}
//                       fill
//                       className={styles.image}
//                     />
//                     <div className={styles.overlay}></div>
//                     <div className={styles.dateBox}>
//                       <FaCalendarAlt />
//                       {formatDate(item.createdAt)}
//                     </div>
//                   </div>

//                   {/* CONTENT */}
//                   <div className={styles.content}>
//                     <div className={styles.time}>
//                       <FaClock /> 5 Min Read
//                     </div>

//                     <h3>{item.title}</h3>

//                     <p>
//                       {item.description.length > 90
//                         ? `${item.description.slice(0, 90)}...`
//                         : item.description}
//                     </p>

//                     {/* Points */}
//                     {item.points?.length > 0 && (
//                       <ul className={styles.pointsList}>
//                         {item.points.slice(0, 2).map((pt, i) => (
//                           <li key={i}>
//                             <FaCheckCircle className={styles.checkIcon} />
//                             {pt}
//                           </li>
//                         ))}
//                       </ul>
//                     )}

//                     <div className={styles.readMore}>
//                       Read Full Update <FaArrowRight />
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         )}

//       </div>
//     </section>
//   );
// }