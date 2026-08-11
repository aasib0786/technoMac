import styles from "./CertificatePage.module.css";

import Image from "next/image";

import certificate1 from "../../../../Images/certificate.jpg";
import certificate2 from "../../../../Images/certificate.jpg";
import certificate3 from "../../../../Images/certificate.jpg";
import certificate4 from "../../../../Images/certificate.jpg";
import certificate5 from "../../../../Images/certificate.jpg";
import certificate6 from "../../../../Images/certificate.jpg";

import {
  FaAward,
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import { useEffect, useState } from "react";
import { getData } from "../../../services/FetchNodeServices";


import { optimizeImageUrl } from "../../../utils/imageOptimizer";

import SkeletonLoader from "../../common/Loader/SkeletonLoader";

export default function CertificatePage() {
  const [certificate, setCertificate] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchAllCertificate = async () => {
    try {
      setLoading(true);
      const response = await getData("certificate/all");
      if (response?.success === true && Array.isArray(response?.data)) {
        const mapped = response.data.map((item) => ({
          ...item,
          image: optimizeImageUrl(item.image, { width: 600 }),
        }));
        setCertificate(mapped);
      }
    } catch (e) {
      console.error("Certificate fetch failed, using static fallback:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCertificate();
  }, []);

  return (
    <section className={styles.certificateSection}>
      <div className={styles.glow}></div>
      <div className="container">
        <Breadcrumb pageName="Certificates" />
        <div className={styles.heading}>
          <span className="hero-tag">
            TECHNOMAC CERTIFICATIONS
          </span>
          <h1>
            Trusted &
            Certified Excellence
          </h1>
          <p>
            TECHNOMAC follows strict
            healthcare quality standards
            and certified manufacturing
            processes to ensure premium
            dental equipment reliability,
            safety and performance.
          </p>

        </div>

        <div className="row mb-5">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className={styles.infoCard}>
              <FaAward />
              <h4>
                Certified Quality
              </h4>
              <p>
                High quality certified
                dental healthcare products.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className={styles.infoCard}>
              <FaShieldAlt />
              <h4>
                Trusted Standards
              </h4>
              <p>
                Products tested with
                international safety standards.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className={styles.infoCard}>
              <FaCheckCircle />
              <h4>
                Reliable Support
              </h4>
              <p>
                Supporting modern clinics
                with trusted technology.
              </p>
            </div>
          </div>
        </div>

        {loading && certificate.length === 0 ? (
          <SkeletonLoader type="certificate" count={4} />
        ) : (
          <div className="row">
            {certificate.map((item, index) => (
              <div className="col-lg-3 col-md-6 mb-3"
                key={index}
              >
                <div className={styles.certificateCard}>
                  <div
                    className={styles.frame}
                    onClick={() => setSelectedImage(item)}
                  >
                    <div className={styles.verifyBadge}>
                      Verified
                      <FaCheckCircle />
                    </div>

                    <div className={styles.innerFrame}>

                      <Image
                        src={item.image}
                        alt={item.title}
                        width={1000}
                        height={420}
                        className={styles.certificateImage}
                      />

                    </div>

                  </div>
                  <div className={styles.cardContent}>
                    <h3>
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedImage && (

        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedImage(null)}
        >

          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className={styles.closeBtn}
              onClick={() => setSelectedImage(null)}
            >

              <FaTimes />

            </button>

            <Image
              src={selectedImage.image}
              alt={selectedImage.title}
              width={1400}
              height={900}
              className={styles.modalImage}
            />

            <h3>
              {selectedImage.title}
            </h3>

          </div>

        </div>

      )}
    </section>
  );
}