import Link from "next/link";
import { useState } from "react";
import styles from "./BlogCard.module.css";
import fallbackImg from "../../../../Images/product1.jpg";

import { optimizeImageUrl } from "../../../utils/imageOptimizer";

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export default function BlogCard({ item }) {
  const defaultImageSrc =
    typeof fallbackImg === "object" ? fallbackImg.src : fallbackImg || "/product1.jpg";

  const rawUrl =
    typeof item?.image === "string" && item.image.trim() !== ""
      ? item.image
      : item?.image?.src || defaultImageSrc;

  const initialUrl = optimizeImageUrl(rawUrl, { width: 600 });
  const [imgSrc, setImgSrc] = useState(initialUrl);

  const excerptText = stripHtml(item?.description || item?.content || '');

  return (
    <Link href={`/blogs/${item?.slug}`} className={styles.blogCard}>
      {/* IMAGE CONTAINER */}
      <div className={styles.imageWrapper}>
        <img
          src={imgSrc}
          alt={item?.title || "Blog Image"}
          onError={() => setImgSrc(defaultImageSrc)}
          className={styles.blogImage}
          loading="lazy"
          decoding="async"
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