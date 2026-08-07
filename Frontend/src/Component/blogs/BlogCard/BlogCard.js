import Link from "next/link";
import { useState } from "react";
import styles from "./BlogCard.module.css";
import fallbackImg from "../../../../Images/product1.jpg";

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export default function BlogCard({ item }) {
  const defaultImageSrc =
    typeof fallbackImg === "object" ? fallbackImg.src : fallbackImg || "/product1.jpg";

  const initialUrl =
    typeof item.image === "string" && item.image.trim() !== ""
      ? item.image
      : item.image?.src || defaultImageSrc;

  const [imgSrc, setImgSrc] = useState(initialUrl);

  const excerptText = stripHtml(item.description || item.content || '');

  return (
    <Link href={`/blogs/${item.slug}`} className={styles.blogCard}>
      {/* IMAGE CONTAINER */}
      <div className={styles.imageWrapper}>
        <img
          src={imgSrc}
          alt={item.title}
          onError={() => setImgSrc(defaultImageSrc)}
          className={styles.blogImage}
        />
        {item.category && (
          <span className={styles.categoryBadge}>{item.category}</span>
        )}
        {/* {item.isFeatured && (
          <span className={styles.featuredBadge}>★ Featured</span>
        )} */}
      </div>

      {/* CONTENT CONTAINER */}
      <div className={styles.content}>
        <h3>{item.title}</h3>
        <p className={styles.description}>{excerptText}</p>
        <div className={styles.cardFooter}>
          <span className={styles.readMore}>Read Article →</span>
        </div>
      </div>
    </Link>
  );
}