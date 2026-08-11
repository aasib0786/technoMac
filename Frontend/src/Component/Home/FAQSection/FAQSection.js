import { useEffect, useState } from "react";
import { FaPlus, FaMinus, } from "react-icons/fa";
import styles from "./FAQSection.module.css";
import { getData } from "../../../services/FetchNodeServices";

import SkeletonLoader from "../../common/Loader/SkeletonLoader";

export default function FAQSection() {
  const [faq, setFaq] = useState([])
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true)

  const fetchAllFaq = async () => {
    try {
      setLoading(true);
      const response = await getData("faq/");
      if (response?.success === true && Array.isArray(response?.data)) {
        setFaq(response.data);
      }
    } catch (e) {
      console.error("FAQ fetch failed:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFaq();
  }, []);

  const toggleFAQ = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <section className={styles.faqSection}>
      {/* GLOW */}
      <div className={styles.glow}></div>

      <div className="container">
        <div className="row align-items-center">
          {/* LEFT */}
          <div className="col-lg-5">
            <div className={styles.leftContent}>
              <h2>
                Frequently Asked
                Questions
              </h2>

              <p>
                Find answers to common questions about Technomac Medical Systems'
                medical and dental products, services, and support.
              </p>

              <button>
                Contact Support
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-7">
            <div className={styles.faqWrapperScroller}>
              {loading && faq.length === 0 ? (
                <SkeletonLoader type="faq" count={4} />
              ) : (
                <div className={styles.faqWrapper}>

                {faq.map((item, index) => (

                  <div
                    className={`${styles.faqItem} ${activeIndex === index
                      ? styles.active
                      : ""
                      }`}
                    key={index}
                  >

                    {/* QUESTION */}

                    <div
                      className={styles.question}
                      onClick={() =>
                        toggleFAQ(index)
                      }
                    >

                      <h4>
                        {item.question}
                      </h4>

                      <div
                        className={styles.icon}
                      >

                        {activeIndex === index ? (
                          <FaMinus />
                        ) : (
                          <FaPlus />
                        )}

                      </div>

                    </div>

                    {/* ANSWER */}
                    <div className={styles.answer}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}