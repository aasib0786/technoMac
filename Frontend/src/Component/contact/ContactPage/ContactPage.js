import { useState, useEffect } from "react";
import styles from "./ContactPage.module.css";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { postData, getData } from "../../../services/FetchNodeServices";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    productInterest: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [contactInfo, setContactInfo] = useState({
    salesPhone: "+91-8448825572, +91-9268825571, +91-9599090411",
    servicePhone: "+91 9311125574",
    email: "info@technomac.com",
    address:
      "Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India",
    whatsappPhone: "+919311125574",
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await getData("contact-info");
        if (res?.success && res?.data) {
          setContactInfo({
            salesPhone:
              res.data.salesPhone ||
              "+91-8448825572, +91-9268825571, +91-9599090411",
            servicePhone: res.data.servicePhone || "+91 9311125574",
            email: res.data.email || "info@technomac.com",
            address:
              res.data.address ||
              "Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India",
            whatsappPhone: res.data.whatsappPhone || "+919311125574",
          });
        }
      } catch (err) {
        console.error("fetchContactInfo error:", err);
      }
    };
    fetchContactInfo();
  }, []);

  // ─── Handle Input Change ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-]{8,15}$/.test(form.phoneNumber.trim())) {
      newErrors.phoneNumber = "Enter a valid phone number";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Form Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await postData("contact", form);

      if (res?.success) {
        setSuccessMsg(
          "Thank you! Your inquiry has been submitted successfully. We will get back to you shortly."
        );

        setForm({
          fullName: "",
          phoneNumber: "",
          email: "",
          productInterest: "",
          message: "",
        });
      } else {
        setSuccessMsg("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Contact Form Submit Error:", error);
      setSuccessMsg("Failed to submit form. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <div className="container">
        <div className={styles.contactBox} style={{marginBottom:'20px'}}>
          <div className="row g-10">
            {/* LEFT COLUMN - INFO */}
            <div className="col-lg-5 col-12">
              <div className={styles.contactInfo}>
                <span className={styles.tag}>Get In Touch</span>

                <h2>Let's Build Better Healthcare Together</h2>
                <p>
                  Connect with TECHNOMAC for premium equipment’s, clinic & hospital
                  setup solutions and healthcare support.
                </p>

                {/* PHONE BOX */}
                <div className={styles.infoBox}>
                  <div className={styles.icon}>
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <h4>Phone Number</h4>
                    <p>Sales Dept: {contactInfo.salesPhone}</p>
                    <p>
                      After-sales Service Dept:{" "}
                      <a href={`tel:${contactInfo.servicePhone.replace(/\s+/g, "")}`}>
                        {contactInfo.servicePhone}
                      </a>
                    </p>
                  </div>
                </div>

                {/* EMAIL BOX */}
                <div className={styles.infoBox}>
                  <div className={styles.icon}>
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4>Email Address</h4>
                    <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                  </div>
                </div>

                {/* ADDRESS BOX */}
                <div className={styles.infoBox}>
                  <div className={styles.icon}>
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4>Office Address</h4>
                    <p>{contactInfo.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - FORM */}
            <div className="col-lg-7 col-12" >
              <div className={styles.formCard}>
                <h3>Send Inquiry</h3>

                {/* SUCCESS MESSAGE */}
                {successMsg && (
                  <div
                    className={`alert ${
                      successMsg.includes("Thank you")
                        ? "alert-success"
                        : "alert-danger"
                    } mb-3`}
                    style={{ fontSize: "14px", borderRadius: "8px" }}
                  >
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    {/* FULL NAME */}
                    <div className="col-md-6 col-12 mb-3">
                      <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          className={errors.fullName ? styles.inputError : ""}
                        />
                        {errors.fullName && (
                          <span className={styles.errorText}>
                            {errors.fullName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PHONE */}
                    <div className="col-md-6 col-12 mb-3">
                      <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className={errors.phoneNumber ? styles.inputError : ""}
                        />
                        {errors.phoneNumber && (
                          <span className={styles.errorText}>
                            {errors.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className="col-md-6 col-12 mb-3">
                      <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          className={errors.email ? styles.inputError : ""}
                        />
                        {errors.email && (
                          <span className={styles.errorText}>
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PRODUCT INTEREST */}
                    <div className="col-md-6 col-12 mb-3">
                      <div className={styles.inputGroup}>
                        <label>Product Interest</label>
                        <select
                          name="productInterest"
                          value={form.productInterest}
                          onChange={handleChange}
                        >
                          <option value="">Select Product</option>
                          <option value="Dental Chair">Dental Chair</option>
                          <option value="Autoclave">Autoclave</option>
                          <option value="X Ray Machine">X-Ray Machine</option>
                          <option value="Suction Machine">Suction Machine</option>
                          <option value="Clinic Setup">Full Clinic Setup</option>
                        </select>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="col-12 mb-4">
                      <div className={styles.inputGroup}>
                        <label>Message</label>
                        <textarea
                          rows="4"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Write your message..."
                          className={errors.message ? styles.inputError : ""}
                        ></textarea>
                        {errors.message && (
                          <span className={styles.errorText}>
                            {errors.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="col-12">
                      <div className={styles.buttonGroup}>
                        <button
                          type="submit"
                          disabled={loading}
                          className={styles.submitBtn}
                        >
                          {loading ? "Submitting..." : "Send Inquiry"}
                        </button>

                        <a
                          href={`https://wa.me/${contactInfo.whatsappPhone.replace(
                            /[^\d]/g,
                            ""
                          )}?text=Hello%20TECHNOMAC,%20I%20have%20an%20inquiry.`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.whatsappBtn}
                        >
                          <FaWhatsapp /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}