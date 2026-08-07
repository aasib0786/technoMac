import Link from "next/link";
import { FaCheckCircle, FaFilePdf, FaWhatsapp } from "react-icons/fa";
import { Swiper, SwiperSlide, } from "swiper/react";
import { Navigation } from "swiper/modules";
import products from "../../../../Data/products";
import styles from "./ProductDetails.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import { useSearchParams } from "next/navigation";
import { getData } from "../../../services/FetchNodeServices";

export default function ProductDetails() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId");
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState({})
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({
  transform: "scale(1)",
  transformOrigin: "50% 50%",
});

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
  

  const fetchProductById = async () => {
    try {
      let response = await getData(`product/${productId}`)
      console.log("RESPONSE==>aa", response)
      if (response.success === true) {
        setProduct(response?.data)
        setActiveImage(response?.data?.images[0])
      }
    } catch (e) {
      console.log(e)
    }
  }

  const fetchProductBycategoryId = async () => {
    try {
      let responses = await getData(`product/by-category/${product?.category?._id}`)
      console.log("RESPONSE==>aacategory", responses)
      if (responses.success === true) {
        setRelatedProducts(responses.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchProductById()
    if (product?.category?._id) {
      fetchProductBycategoryId()
    }
  }, [productId, product?.category?._id])

  console.log("RESPONSE==>aa", product.images)

  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const filterRelatedProducts = relatedProducts.filter((item) => item?._id !== product?._id)
  return (

    <section className={styles.detailsPage}>
      <div className="container">
        <Breadcrumb pageName={product?.name} />

        <div className="row">
          <div className="col-lg-6">
            <div className={styles.imageWrapper}>
              <div className={styles.mainImage}  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}>
                <Image
                  src={activeImage}
                  alt={product?.name}
                  width={1000}
                  height={800}
                  className={styles.mainProductImage}
                      style={zoomStyle}
                />
              </div>
              <div className={styles.galleryWrapper}>
                <div className={styles.gallery}>
                  {galleryImages.map((img, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`${styles.thumbBox}
                        ${activeImage === img
                          ? styles.activeThumb
                          : ""
                        }`}
                      onClick={() =>
                        setActiveImage(img)
                      }
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
              <span className="hero-tag">
                {product?.category?.name}
              </span>
              <h1>
                {product?.name}
              </h1>
              <p className={styles.description}>
                {product?.description}
              </p>

              {Array.isArray(product?.features) &&
                product.features.length > 0 && (
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
                {/* <button className={styles.primaryBtn}>
                  <FaWhatsapp />
                  WhatsApp Inquiry
                </button> */}
                <a href={`https://wa.me/+91${9311125574}?text=${encodeURIComponent("Hello TECHNOMAC, I am interested in your products.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button className="quoteBtn d-flex align-items-center gap-2">
                    <FaWhatsapp />
                    WhatsApp Inquiry
                  </button>
                </a>
                {/* <button className={styles.secondaryBtn}>
                  <FaFilePdf />
                  Download Brochure
                </button> */}
              </div>
            </div>
          </div>
        </div>
        
        {filterRelatedProducts.length > 0 && <div className={styles.relatedSection}>
          <div className={styles.relatedHeading}>
            <span>
              Related Products
            </span>
            <h2>
              Explore More Equipment
            </h2>
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
              <SwiperSlide key={item.id}>
                <div className={styles.relatedCard}>
                  <div className="globalProductCard">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={250}
                      height={200}
                    />
                    <span>
                      {item?.category?.name}
                    </span>
                    <h3>
                      {item.name}
                    </h3>
                    <p>
                      {item?.description}
                    </p>
                    <Link href={`/product/${item?.name}?productId=${item._id}`}>
                      <button>
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>}
      </div>
    </section>
  );
}