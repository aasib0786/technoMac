import styles from "./OurClients.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getData } from "../../../services/FetchNodeServices";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { optimizeImageUrl } from "../../../utils/imageOptimizer";
import SkeletonLoader from "../../common/Loader/SkeletonLoader";

export default function OurClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await getData("client/all");
      if (response?.success) {
        const active = (response.data || [])
          .filter((c) => c.isActive)
          .sort((a, b) => a.order - b.order)
          .map((c) => ({
            ...c,
            image: optimizeImageUrl(c.image, { width: 300 }),
          }));
        setClients(active);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <section className={styles.clientSection}>

      {/* GLOW */}
      <div className={styles.glow}></div>

      <div className="container">

        {/* HEADING */}
        <div className={styles.heading}>
          {/* <span>TRUSTED CLIENTS</span> */}
          <h2>Our Valued Clients</h2>
          <p>
            A trusted partner to Hospitals, Medical and Dental clinics, Diagnostic Centers ,
            and Healthcare Professionals across India.
          </p>
        </div>

        {/* SKELETON */}
        {isLoading && (
          <SkeletonLoader type="client" count={6} />
        )}

        {/* EMPTY */}
        {!isLoading && clients.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>
            No clients to display.
          </p>
        )}

        {/* CLIENT GRID */}
        {!isLoading && clients.length > 0 && (
          // <div className="row justify-content-center">
          //   {clients.map((item) => (
          //     <div className="col-lg-2 col-md-4 col-6 mb-4" key={item._id}>
          //       <div className={styles.clientCard}>

          //         {/* IMAGE */}
          //         <div style={{ position: "relative", width: "100%", height: "100px" }}>
          //           <Image
          //             src={item.image}
          //             alt={item.name || "Client Logo"}
          //             fill
          //             className={styles.clientLogo}
          //             sizes="(max-width: 576px) 50vw, 16vw"
          //           />
          //         </div>
          //       </div>
          //     </div>
          //   ))}
          // </div>
          <Swiper
            modules={[Autoplay]}
            slidesPerView={2}
            spaceBetween={20}
            loop={true}
            speed={4000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              576: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
              992: {
                slidesPerView: 5,
              },
              1200: {
                slidesPerView: 6,
              },
            }}
            className={styles.clientSlider}
          >

            {clients.map((item) => (

              <SwiperSlide key={item._id}>

                <div className={styles.clientCard}>

                  <div className={styles.logoWrapper}>

                    <Image
                      src={item.image}
                      alt={item.name || "Client Logo"}
                      fill
                      className={styles.clientLogo}
                      sizes="(max-width: 576px) 50vw, 16vw"
                    />

                  </div>

                </div>

              </SwiperSlide>

            ))}

          </Swiper>
        )}

      </div>
    </section>
  );
}