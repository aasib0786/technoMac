import styles from "./HeroBanner.module.css";
import { Swiper, SwiperSlide, } from "swiper/react";
import { Autoplay, Pagination, } from "swiper/modules";
import Image from "next/image";
import { FaArrowRight, } from "react-icons/fa";
import { getData } from "../../../services/FetchNodeServices";
import heroImage1 from "../../../../Images/banner1.jpg";
import heroImage2 from "../../../../Images/banner2.jpg";
import heroImage3 from "../../../../Images/banner3.jpg";
import heroImage4 from "../../../../Images/banner4.jpg";
import { useEffect, useState } from "react";
import Link from "next/link";


import { optimizeImageUrl } from "../../../utils/imageOptimizer";

const defaultStaticBanners = [
  { image: heroImage1, title: "Precision In Every Smile", desc: "Advanced dental technology engineered for exceptional clinical results." },
  { image: heroImage2, title: "Modern Clinic Innovations", desc: "Transforming dental practices with ergonomic, reliable equipment." },
];

export default function HeroBanner() {
  const [banners, setBanners] = useState(defaultStaticBanners);
  const [loading, setLoading] = useState(false);

  const fetchAllBanners = async () => {
    try {
      const response = await getData("banner/all");
      if (response?.success === true && Array.isArray(response?.banners) && response.banners.length > 0) {
        const mapped = response.banners.map((item) => ({
          image: optimizeImageUrl(item.imageUrl || item.image || item.banner_image),
          category: item?.categoryId || {},
          subCategory: item?.subCategoryId || {},
          title: item.title || item.banner_title || "",
          desc: item.desc || item.description || item.subtitle || "",
          isRemote: item.isActive || true,
        }));
        setBanners(mapped);
      }
    } catch (e) {
      console.error("Banner fetch failed, using static fallback:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBanners();
  }, []);

  return (
    <section className={styles.heroSection}>
      <Swiper
        modules={[
          Autoplay,
          Pagination,
        ]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        loop={true}
        speed={1200}
        className={styles.heroSwiper}
      >
        {banners.map((item, index) => (
          <SwiperSlide key={index}>
            <div className={styles.bannerItem}>
              {/* IMAGE */}
              <Image
                src={item.image}
                alt={item.title || "Dental Banner"}
                fill
                priority={index === 0}
                sizes="100vw"
                className={styles.bannerImage}
              />

              {/* OVERLAY */}

              <div className={styles.overlay}></div>

              {/* CONTENT */}

              <div className="container">

                <div className={styles.bannerContent}>

                  <span>
                    TECHNOMAC DENTAL
                  </span>

                  <h1>
                    {item.title}
                  </h1>

                  <p>
                    {item.desc}
                  </p>

                  {/* BUTTONS */}

                  <div className={styles.buttonGroup}>

                    <button
                      className={styles.primaryBtn}
                    >
                      <Link
                        href={{ pathname: "/products", query: { subCategory: item?.subCategory?._id } }}
                        className={styles.productCard}
                        style={{ textDecoration: "none", color: '#fff' }}
                      >
                        Explore Products

                        <FaArrowRight />
                      </Link>
                    </button>

                    <button
                      className={styles.secondaryBtn}

                    >
                      <Link
                        href={{ pathname: "/contact" }}
                        className={styles?.productCard}
                        style={{ textDecoration: "none", color: '#fff' }}
                      >
                        Book Demo
                      </Link>
                    </button>

                  </div>

                  {/* SCROLL */}

                  {/* <div className={styles.scrollBtn}>

                    <span>
                      Scroll
                    </span>

                    <div className={styles.mouse}>

                      <div className={styles.wheel}></div>

                    </div>

                  </div> */}

                </div>

              </div>

            </div>

          </SwiperSlide>

        ))}

      </Swiper>

    </section >
  );
}   