import Link from "next/link";
import styles from "./ProductCard.module.css";
import Image from "next/image";

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
            src={item.image || (Array.isArray(item.images) && item.images[0]) || ""}
            alt={item.name}
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