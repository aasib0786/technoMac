import { FaStar, FaQuoteRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import styles from "./ReviewSection.module.css";

import image1 from "../../../../Images/review1.webp";
import image2 from "../../../../Images/review2.webp";
import image3 from "../../../../Images/review3.webp";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getData } from "../../../services/FetchNodeServices"; // ✅ was missing


// ── Star renderer (uses rating field) ────────────────────────────
function StarRating({ rating = 5 }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} style={{ color: i < rating ? "#ffb400" : "#ddd" }} />
      ))}
    </div>
  );
}

import SkeletonLoader from "../../common/Loader/SkeletonLoader";

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]); // ✅ static as default
  const [loading, setLoading] = useState(true);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await getData("testimonial/"); // ✅ fixed endpoint
      console.log("Reviews Response=>", response);

      if (response?.success === true && response?.data?.length > 0) {
        setReviews(response.data); // ✅ API data replaces static
      }
      // If empty or failed → static fallback already in state
    } catch (e) {
      console.error("Reviews fetch failed, using static fallback:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  return (
    <>
      {/* ── Marquee ── */}
      <section className={styles.marqueeSection}>
        <div className={styles.marquee}>
          <div className={styles.track}>
            <span>Wellness</span>
            <span>Health</span>
            <span>Care</span>
            <span>Trust</span>
            <span>Dental</span>
            <span>Innovation</span>
            <span>TECHNOMAC</span>
            {/* DUPLICATE FOR SMOOTH LOOP */}
            <span>Wellness</span>
            <span>Health</span>
            <span>Care</span>
            <span>Trust</span>
            <span>Dental</span>
            <span>Innovation</span>
            <span>TECHNOMAC</span>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className={styles.reviewSection}>
        <div className="container">

          {/* HEADING */}
          <div className={styles.heading}>
            {/* <span>Testimonials</span> */}
            <h2>What Doctors Say About TECHNOMAC</h2>
            <p>Trusted by thousands of dental professionals across India.</p>
          </div>

          {/* SLIDER */}
          {loading && reviews.length === 0 ? (
            <SkeletonLoader type="review" count={3} />
          ) : (
            <Swiper
              slidesPerView={3}
              spaceBetween={30}
              loop={true}
              speed={1000}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              modules={[Autoplay, Pagination]}
              breakpoints={{
                0:    { slidesPerView: 1 },
                768:  { slidesPerView: 2 },
                1200: { slidesPerView: 3 },
              }}
              className={styles.reviewSwiper}
            >
            {reviews.map((item) => (
              <SwiperSlide key={item._id}>
                <div className={styles.reviewCard}>

                  {/* QUOTE */}
                  <div className={styles.quoteIcon}><FaQuoteRight /></div>

                  {/* STARS — dynamic from rating field */}
                  <StarRating rating={item.rating ?? 5} />

                  {/* REVIEW TEXT — uses `review` field */}
                  <p className={styles.reviewText}>
                    {item?.review || item.description}
                  </p>

                  {/* USER */}
                  <div className={styles.userInfo}>
                    <Image
                      width={80}
                      height={80}
                      src={
                        item?.image && item?.image !== ""
                          ? item?.image          // ✅ Cloudinary URL
                          : image1              // ✅ fallback if image is empty string
                      }
                      alt={item?.name}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <h4>{item?.name}</h4>
                      <span>{item?.designation}</span>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          )}

        </div>
      </section>
    </>
  );
}