import styles from "./SkeletonLoader.module.css";

export default function SkeletonLoader({ type = "product", count = 4 }) {
  if (type === "product") {
    return (
      <div className="row">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-3 col-md-6 col-6 mb-4" key={i}>
            <div className={styles.productCard}>
              <div className={`${styles.shimmer} ${styles.productImage}`} />
              <div className={`${styles.shimmer} ${styles.productTag}`} />
              <div className={`${styles.shimmer} ${styles.productTitle}`} />
              <div className={`${styles.shimmer} ${styles.productTitleShort}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "category-grid") {
    return (
      <div className="row">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-3 col-md-6 col-6 mb-4" key={i}>
            <div className={styles.productCard}>
              <div className={`${styles.shimmer} ${styles.productImage}`} />
              <div className={`${styles.shimmer} ${styles.productTitle}`} style={{ margin: "0 auto 8px auto" }} />
              <div className={`${styles.shimmer} ${styles.productTag}`} style={{ margin: "0 auto" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "category-strip") {
    return (
      <div className="row mb-4">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-2 col-md-3 col-6 mb-3" key={i}>
            <div className={styles.categoryStripItem}>
              <div className={`${styles.shimmer} ${styles.stripImage}`} />
              <div className={`${styles.shimmer} ${styles.stripText}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "blog") {
    return (
      <div className="row g-4">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-xl-3 col-lg-4 col-md-6 col-12" key={i}>
            <div className={styles.blogCard}>
              <div className={`${styles.shimmer} ${styles.blogImage}`} />
              <div className={styles.blogContent}>
                <div className={`${styles.shimmer} ${styles.blogTag}`} />
                <div className={`${styles.shimmer} ${styles.blogTitle}`} />
                <div className={`${styles.shimmer} ${styles.blogDesc}`} />
                <div className={`${styles.shimmer} ${styles.blogDescShort}`} />
                <div className={`${styles.shimmer} ${styles.blogFooter}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "update") {
    return (
      <div className="row">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-3 col-md-6 mb-4" key={i}>
            <div className={styles.updateCard}>
              <div className={`${styles.shimmer} ${styles.updateImage}`} />
              <div className={`${styles.shimmer} ${styles.updateTitle}`} />
              <div className={`${styles.shimmer} ${styles.updateSubtitle}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="row">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-4 col-md-6 col-12 mb-4" key={i}>
            <div className={styles.reviewCard}>
              <div className={`${styles.shimmer} ${styles.reviewStars}`} />
              <div className={`${styles.shimmer} ${styles.reviewText}`} />
              <div className={`${styles.shimmer} ${styles.reviewText}`} />
              <div className={`${styles.shimmer} ${styles.reviewTextShort}`} />
              <div className={styles.reviewAuthor}>
                <div className={`${styles.shimmer} ${styles.reviewAvatar}`} />
                <div className={styles.reviewAuthorInfo}>
                  <div className={`${styles.shimmer} ${styles.reviewName}`} />
                  <div className={`${styles.shimmer} ${styles.reviewRole}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "faq") {
    return (
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div className={styles.faqItem} key={i}>
            <div className={`${styles.shimmer} ${styles.faqQuestion}`} />
            <div className={`${styles.shimmer} ${styles.faqIcon}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "client") {
    return (
      <div className="row">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-2 col-md-4 col-6 mb-4" key={i}>
            <div className={styles.clientCard}>
              <div className={`${styles.shimmer} ${styles.clientLogo}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "certificate") {
    return (
      <div className="row">
        {Array.from({ length: count }).map((_, i) => (
          <div className="col-lg-4 col-md-6 col-12 mb-4" key={i}>
            <div className={styles.certificateCard}>
              <div className={`${styles.shimmer} ${styles.certificateImage}`} />
              <div className={`${styles.shimmer} ${styles.certificateTitle}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className={`container ${styles.detailWrapper}`}>
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className={`${styles.shimmer} ${styles.detailImage}`} />
            <div className={styles.detailThumbnails}>
              <div className={`${styles.shimmer} ${styles.detailThumb}`} />
              <div className={`${styles.shimmer} ${styles.detailThumb}`} />
              <div className={`${styles.shimmer} ${styles.detailThumb}`} />
            </div>
          </div>
          <div className="col-lg-6">
            <div className={`${styles.shimmer} ${styles.detailBadge}`} />
            <div className={`${styles.shimmer} ${styles.detailTitle}`} />
            <div className={`${styles.shimmer} ${styles.detailSubtitle}`} />
            <div className={`${styles.shimmer} ${styles.detailParagraph}`} />
            <div className={`${styles.shimmer} ${styles.detailParagraph}`} />
            <div className={`${styles.shimmer} ${styles.detailParagraphShort}`} />
            <div className={`${styles.shimmer} ${styles.detailBtn}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {Array.from({ length: count }).map((_, i) => (
        <div className="col-lg-3 col-md-6 col-6 mb-4" key={i}>
          <div className={styles.productCard}>
            <div className={`${styles.shimmer} ${styles.productImage}`} />
            <div className={`${styles.shimmer} ${styles.productTitle}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
