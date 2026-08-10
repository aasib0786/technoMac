import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { FaCheckCircle, FaFilePdf, FaWhatsapp } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import styles from "./ProductDetails.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import { useSearchParams } from "next/navigation";
import { getData } from "../../../services/FetchNodeServices";

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

export default function ProductDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdentifier = router?.query?.slug || searchParams?.get("productId") || router?.query?.productId;

  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [zoomStyle, setZoomStyle] = useState({
    transform: "scale(1)",
    transformOrigin: "50% 50%",
  });
  const [contactInfo, setContactInfo] = useState({});

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      transform: "scale(2)",
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "50% 50%",
    });
  };

  const fetchProduct = async () => {
    if (!productIdentifier) return;
    try {
      let response = await getData(`product/${encodeURIComponent(productIdentifier)}`);
      if (response?.success === true && response?.data) {
        setProduct(response.data);
        if (Array.isArray(response.data.images) && response.data.images.length > 0) {
          setActiveImage(response.data.images[0]);
        }
      }
    } catch (e) {
      console.error("fetchProduct error:", e);
    }
  };

  const fetchProductBycategoryId = async () => {
    if (!product?.category?._id) return;
    try {
      let responses = await getData(`product/by-category/${product?.category?._id}`);
      if (responses?.success === true) {
        setRelatedProducts(responses.data);
      }
    } catch (e) {
      console.error("fetchProductBycategoryId error:", e);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productIdentifier]);

  useEffect(() => {
    if (product?.category?._id) {
      fetchProductBycategoryId();
    }
  }, [product?.category?._id]);

  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const filterRelatedProducts = relatedProducts.filter((item) => item?._id !== product?._id);

  // ── SEO Meta Calculations ────────────────────────────────────────────────
  const pageTitle = product?.metaTitle
    ? product.metaTitle
    : product?.name
      ? `${product.name} | TECHNOMAC`
      : "Medical & Dental Equipment | TECHNOMAC";

  const pageDescription = product?.metaDescription
    ? product.metaDescription
    : product?.description
      ? product.description.slice(0, 160)
      : "Explore high-quality medical and dental equipment manufactured by TECHNOMAC Medical Systems.";

  const pageKeywords = product?.metaKeywords
    ? product.metaKeywords
    : [
      product?.name,
      product?.category?.name,
      product?.parentCategoryId?.name,
      "TECHNOMAC",
      "dental equipment",
      "medical equipment",
    ]
      .filter(Boolean)
      .join(", ");

  const mainImageUrl = activeImage || (galleryImages[0] || "https://www.technomac.in/logo.png");

  const canonicalUrl = product?.canonicalUrl
    ? product.canonicalUrl
    : `https://www.technomac.in/product/${product.slug || product._id || ""}`;

  // ── JSON-LD Structured Data Schema.org Product ────────────────────────────
  const jsonLdSchema = product?._id
    ? {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: galleryImages,
      description: pageDescription,
      sku: product.sku || product._id,
      brand: {
        "@type": "Brand",
        name: "TECHNOMAC",
      },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "INR",
        price: product.price || "0",
        availability: "https://schema.org/InStock",
      },
    }
    : null;

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await getData("contact-info");
        if (res?.success && res?.data) {
          setContactInfo({
            salesPhone:
              res.data.salesPhone,
            servicePhone: res.data.servicePhone,
            email: res.data.email,
            address: res.data.address,
            whatsappPhone: res.data.whatsappPhone,
          });
        }
      } catch (err) {
        console.error("fetchContactInfo error:", err);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <>
      <Head>
        {/* ── Primary Meta ── */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* ── Open Graph ── */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={mainImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="TECHNOMAC" />

        {/* ── Twitter Cards ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={mainImageUrl} />

        {/* ── JSON-LD Structured Data Script ── */}
        {jsonLdSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLdSchema),
            }}
          />
        )}
      </Head>

      <section className={styles.detailsPage}>
        <div className="container">
          <Breadcrumb pageName={product?.name || "Product Details"} />

          <div className="row">
            <div className="col-lg-6">
              <div className={styles.imageWrapper}>
                <div
                  className={styles.mainImage}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {activeImage ? (
                    <Image
                      src={activeImage}
                      alt={product?.name || "Product"}
                      width={1000}
                      height={800}
                      className={styles.mainProductImage}
                      style={zoomStyle}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      No Image Available
                    </div>
                  )}
                </div>
                <div className={styles.galleryWrapper}>
                  <div className={styles.gallery}>
                    {galleryImages.map((img, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`${styles.thumbBox} ${activeImage === img ? styles.activeThumb : ""
                          }`}
                        onClick={() => setActiveImage(img)}
                      >
                        <Image
                          src={img}
                          alt={`thumb-${index}`}
                          width={100}
                          height={100}
                          className={styles.thumbImage}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className={styles.content}>
                <span className="hero-tag">{product?.category?.name}</span>
                <h1>{product?.name}</h1>
                <p className={styles.description}>{product?.description}</p>

                {Array.isArray(product?.features) && product.features.length > 0 && (
                  <div className={styles.sectionBox}>
                    <h3>Salient Features</h3>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>
                          <FaCheckCircle />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(product?.specifications) &&
                  product.specifications.length > 0 && (
                    <div className={styles.sectionBox}>
                      <h3>Technical Specifications</h3>
                      <div className={styles.specGrid}>
                        {product.specifications.map((spec, index) => (
                          <div key={index}>
                            <span>{spec.label || spec.key}</span>
                            <p>{spec.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className={styles.buttonGroup}>
                  <a
                    href={`https://wa.me/${contactInfo?.whatsappPhone}?text=${encodeURIComponent(
                      `Hello TECHNOMAC, I am interested in ${product?.name || "your products"}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button className="quoteBtn d-flex align-items-center gap-2">
                      <FaWhatsapp />
                      WhatsApp Inquiry
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {filterRelatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
              <div className={styles.relatedHeading}>
                <span>Related Products</span>
                <h2>Explore More Equipment</h2>
              </div>
              <Swiper
                slidesPerView={3}
                spaceBetween={24}
                navigation={true}
                modules={[Navigation]}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 2,
                  },
                  1200: {
                    slidesPerView: 3,
                  },
                }}
              >
                {filterRelatedProducts?.map((item) => (
                  <SwiperSlide key={item._id || item.id}>
                    <div className={styles.relatedCard}>
                      <div className="globalProductCard">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.name}
                            width={250}
                            height={200}
                          />
                        ) : null}
                        <span>{item?.category?.name}</span>
                        <h3>{item.name}</h3>
                        {/* <p>{item?.description}</p> */}
                        <Link href={`/product/${item?.slug || toSlug(item?.name) || item._id}`}>
                          <button>View Details</button>
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </section>
    </>
  );
}