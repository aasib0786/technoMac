import { useState } from "react";
import Link from "next/link";
import { FaClock, FaCalendarAlt, FaArrowLeft, FaFolder } from "react-icons/fa";
import styles from "./BlogDetails.module.css";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import fallbackImg from "../../../../Images/product1.jpg";

export default function BlogDetails({ blog }) {
  if (!blog) return null;

  const defaultImageSrc =
    typeof fallbackImg === "object" ? fallbackImg.src : fallbackImg || "/product1.jpg";

  const initialUrl =
    typeof blog?.image === "string" && blog.image.trim() !== ""
      ? blog.image
      : blog?.image?.src || defaultImageSrc;

  const [imgSrc, setImgSrc] = useState(initialUrl);

  const rawHtmlContent = blog.content || blog.description || "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently Updated";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className={styles.detailsSection} style={{marginTop: "50px"}}>
      <div className="container">
        <Breadcrumb pageName={blog.title || "Blog Details"} />

        <div className={styles.wrapper}>
          {/* TOP BACK LINK */}
          <div className={styles.topBar}>
            <Link href="/blogs" className={styles.backBtn}>
              <FaArrowLeft /> Back to Blogs
            </Link>
          </div>

          {/* ARTICLE HEADER */}
          <div className={styles.header}>
            <div className={styles.metaRow}>
              {blog.category && (
                <span className={styles.categoryBadge}>
                  <FaFolder className={styles.badgeIcon} />
                  {blog.category}
                </span>
              )}
              {blog.readTime && (
                <span className={styles.metaItem}>
                  <FaClock /> {blog.readTime}
                </span>
              )}
              <span className={styles.metaItem}>
                <FaCalendarAlt /> {formatDate(blog.createdAt)}
              </span>
            </div>

            <h1 className={styles.title}>{blog.title}</h1>
          </div>

          {/* HERO COVER IMAGE */}
          <div className={styles.imageWrapper}>
            <img
              src={imgSrc}
              alt={blog.title}
              onError={() => setImgSrc(defaultImageSrc)}
              className={styles.blogImage}
            />
          </div>

          {/* RICH CONTENT CARD */}
          <div className={styles.articleCard}>
            <div
              className={styles.richContent}
              dangerouslySetInnerHTML={{ __html: rawHtmlContent }}
            />

            {/* BOTTOM FOOTER BUTTON */}
            <div className={styles.articleFooter}>
              <Link href="/blogs" className={styles.footerBackBtn}>
                <FaArrowLeft /> Explore More Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}