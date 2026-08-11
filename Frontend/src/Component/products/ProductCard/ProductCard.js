import Link from "next/link";
import styles from "./ProductCard.module.css";
import Image from "next/image";
import { optimizeImageUrl } from "../../../utils/imageOptimizer";
import dummyImage from "../../../../Images/landing_doctors.png";

// Helper to convert product name to clean URL slug without %20
const toSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function ProductCard({ item }) {
  const productSlug = item?.slug || toSlug(item?.name) || item?._id;
  const rawImage = item?.image || (Array.isArray(item?.images) && item.images[0]) || dummyImage;
  const optimizedSrc = optimizeImageUrl(rawImage, { width: 500 });

  return (
    <div key={item._id}>
      <Link
        href={`/product/${productSlug}`}
        className={styles.productCard}
      >
        <div className={styles.imageWrapper}>
          <Image
            width={400}
            height={300}
            src={optimizedSrc || dummyImage}
            alt={item?.name || "Product"}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className={styles.cardContent}>
          <h3>
            {item?.name}
          </h3>
          {/* <p>
            {item?.description}
          </p> */}
          <span>{item?.category?.name}</span>
        </div>
      </Link>
    </div>
  );
}