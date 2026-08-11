import styles from "./HomeProducts.module.css";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getData } from "../../../services/FetchNodeServices";

import { optimizeImageUrl } from "../../../utils/imageOptimizer";

// Helper to convert category name into a clean URL slug without %20
const toSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

import SkeletonLoader from "../../common/Loader/SkeletonLoader";

export default function HomeProducts() {
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllCategory = async () => {
    try {
      setLoading(true);
      const response = await getData("parentCategory/all");
      if (response?.success === true && Array.isArray(response.data)) {
        const mapped = response.data.map((item) => ({
          _id: item._id,
          image: optimizeImageUrl(item.imageUrl || item.image || item.category_image, { width: 400 }),
          name: item.title || item.name || "",
          desc: item.desc || item.description || item.subtitle || "",
          isRemote: item.isActive || true,
        }));
        setCategory(mapped);
      }
    } catch (e) {
      console.error("Category fetch failed, using static fallback:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategory();
  }, []);

  return (
    <section className={styles.productSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            Advanced Dental
            Equipment Solutions
          </h2>

          <p>
            Explore premium dental
            healthcare products designed
            for modern clinics and professionals.
          </p>
        </div>

        {/* GRID */}
        {loading && category.length === 0 ? (
          <SkeletonLoader type="category-grid" count={4} />
        ) : (
          <div className="row">
          {category.map((item) => (
            <div className="col-lg-3 col-md-6 col-6 mb-4" key={item._id}>
              <Link
                href={{
                  pathname: "/products",
                  query: { parentCategory: toSlug(item?.name) || item?.name },
                }}
                className={styles.productCard}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    width={400}
                    height={300}
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3>
                    {item.name}
                  </h3>
                  <span>
                    Explore Products
                  </span>
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