// "use client";

// import { useEffect, useState } from "react";

// import styles from "./EnquiryPopup.module.css";

// import {
//   FaTimes,
//   FaUser,
//   FaEnvelope,
//   FaPhoneAlt,
//   FaCommentDots,
// } from "react-icons/fa";

// export default function EnquiryPopup() {

//   const [show, setShow] = useState(false);

//   const [mounted, setMounted] = useState(false);
//   const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', message: '', });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [successMsg, setSuccessMsg] = useState("");


//   /* POPUP SHOW */

//   useEffect(() => {

//     setMounted(true);

//     if (
//       typeof window !== "undefined"
//     ) {

//       const submitted =
//         localStorage.getItem(
//           "enquirySubmitted"
//         );

//       if (!submitted) {

//         const timer =
//           setTimeout(() => {

//             setShow(true);

//           }, 5000);

//         return () =>
//           clearTimeout(timer);
//       }
//     }

//   }, []);

//   /* INPUT CHANGE */




//   // ─── Handle Input Change ───────────────────────────────────────────────────
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));

//     // ✅ Clear error on type
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   // ─── Validation ────────────────────────────────────────────────────────────
//   const validate = () => {
//     const newErrors = {};

//     if (!form.fullName.trim()) {
//       newErrors.fullName = "Name is required";
//     }

//     if (!form.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//       newErrors.email = "Enter a valid email";
//     }

//     if (!form.phoneNumber.trim()) {
//       newErrors.phoneNumber = "Phone is required";
//     } else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) {
//       newErrors.phoneNumber = "Enter a valid 10-digit phone number";
//     }

//     if (!form.message.trim()) {
//       newErrors.message = "Message is required";
//     }

//     if (!form.productInterest.trim()) {
//       newErrors.productInterest = "Message is required";
//     }


//     return newErrors;
//   };

//   // ─── Handle Submit ─────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     // ✅ Payload
//     const payload = {
//       fullName: form.fullName.trim(),
//       email: form.email.trim(),
//       phoneNumber: form.phoneNumber.trim(),
//       message: form.message.trim(),
//       productInterest: form.productInterest.trim(),
//     };

//     console.log("Enquiry Payload =>", payload);

//     setLoading(true);
//     setSuccessMsg("");

//     try {
//       const response = await postData("contact/create", payload);
//       console.log("Enquiry Response =>", response);

//       if (response?.success === true) {
//         setSuccessMsg("Thank you! We'll get back to you soon.");
//         setForm({ fullName: '', phoneNumber: '', email: '', productInterest: '', message: '', }); // ✅ reset
//         setErrors({});
//       } else {
//         setErrors({ api: response?.message || "Something went wrong. Please try again." });
//       }
//     } catch (e) {
//       console.error("Enquiry submit failed:", e?.message);
//       setErrors({ api: "Server error. Please try again later." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* SSR FIX */

//   if (!mounted) return null;

//   /* HIDE POPUP */

//   if (!show) return null;

//   return (

//     <div className={styles.overlay}>

//       <div className={styles.popup}>

//         {/* CLOSE */}

//         <button
//           className={styles.closeBtn}
//           onClick={() =>
//             setShow(false)
//           }
//         >

//           <FaTimes />

//         </button>

//         {/* TOP */}

//         <span className={styles.tag}>
//           TECHNOMAC
//         </span>

//         <h2>
//           Quick Enquiry
//         </h2>

//         <p>
//           Get free consultation for
//           dental clinic setup and
//           equipment solutions.
//         </p>

//         {/* FORM */}
//         <form
//           onSubmit={handleSubmit}
//         >

//           <div className="row">

//             {/* NAME */}

//             <div className="col-md-6">

//               <div className={styles.inputBox}>

//                 <FaUser />

//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Your Name"
//                   required
//                   onChange={handleChange}
//                 />

//               </div>

//             </div>

//             {/* EMAIL */}

//             <div className="col-md-6">

//               <div className={styles.inputBox}>

//                 <FaEnvelope />

//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   required
//                   onChange={handleChange}
//                 />

//               </div>

//             </div>

//             {/* MOBILE */}

//             <div className="col-md-6">

//               <div className={styles.inputBox}>

//                 <FaPhoneAlt />

//                 <input
//                   type="text"
//                   name="mobile"
//                   placeholder="Mobile"
//                   required
//                   onChange={handleChange}
//                 />

//               </div>

//             </div>

//             {/* QUERY */}

//             <div className="col-md-6">

//               <div className={styles.inputBox}>

//                 <FaCommentDots />

//                 <textarea
//                   name="query"
//                   placeholder="Your Query"
//                   rows="1"
//                   required
//                   onChange={handleChange}
//                 ></textarea>

//               </div>

//             </div>

//           </div>

//           {/* BUTTON */}

//           <button
//             type="submit"
//             className={styles.submitBtn}
//           >

//             Submit Enquiry

//           </button>

//         </form>

//       </div>

//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import styles from "./EnquiryPopup.module.css";
import {
  FaTimes, FaUser, FaEnvelope,
  FaPhoneAlt, FaCommentDots,
} from "react-icons/fa";
import { postData } from "../../services/FetchNodeServices";


export default function EnquiryPopup() {
  const [show,       setShow]      = useState(false);
  const [mounted,    setMounted]   = useState(false);
  const [loading,    setLoading]   = useState(false);
  const [successMsg, setSuccessMsg]= useState("");
  const [errors,     setErrors]    = useState({});

  // ✅ Removed productInterest — not in this form
  const [form, setForm] = useState({
    fullName:    "",
    email:       "",
    phoneNumber: "",
    message:     "",
  });

  // ─── Show popup after 5s (only if not submitted before) ───────────────────
  useEffect(() => {
    setMounted(true);
    const submitted = localStorage.getItem("enquirySubmitted");
    if (!submitted) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // ─── Handle Change ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.fullName.trim())
      e.fullName = "Name is required";

    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";

    if (!form.phoneNumber.trim())
      e.phoneNumber = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber))
      e.phoneNumber = "Enter valid 10-digit number";

    if (!form.message.trim())
      e.message = "Message is required";

    return e;
  };

  // ─── Handle Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      fullName:    form.fullName.trim(),
      email:       form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      message:     form.message.trim(),
    };

    console.log("Enquiry Payload =>", payload);
    setLoading(true);
    setSuccessMsg("");

    try {
      const response = await postData("contact/create", payload);
      console.log("Enquiry Response =>", response);

      if (response?.success === true) {
        setSuccessMsg("Thank you! We'll get back to you soon.");
        setForm({ fullName: "", email: "", phoneNumber: "", message: "" });
        setErrors({});

        // ✅ Save to localStorage so popup doesn't show again
        localStorage.setItem("enquirySubmitted", "true");

        // ✅ Auto close popup after 3 seconds
        setTimeout(() => setShow(false), 3000);
      } else {
        setErrors({ api: response?.message || "Something went wrong." });
      }
    } catch (err) {
      console.error("Enquiry submit failed:", err?.message);
      setErrors({ api: "Server error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  // ─── Close handler ──────────────────────────────────────────────────────────
  const handleClose = () => setShow(false);

  // ─── SSR guard ─────────────────────────────────────────────────────────────
  if (!mounted || !show) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>

      {/* ✅ Stop click propagation so clicking inside doesn't close */}
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

        {/* CLOSE */}
        <button className={styles.closeBtn} onClick={handleClose}>
          <FaTimes />
        </button>

        {/* HEADER */}
        <span className="hero-tag">TECHNOMAC</span>
        <h2>Quick Enquiry</h2>
        <p>Get free consultation for dental clinic setup and equipment solutions.</p>

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <div className={styles.successMsg}>
            {successMsg}
          </div>
        )}

        {/* FORM — hide after success */}
        {!successMsg && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">

              {/* NAME */}
              <div className="col-md-6">
                <div className={`${styles.inputBox} ${errors.fullName ? styles.inputError : ""}`}>
                  <FaUser />
                  <input
                    type="text"
                    name="fullName"        // ✅ fixed name
                    value={form.fullName}  // ✅ controlled
                    placeholder="Your Name"
                    onChange={handleChange}
                  />
                </div>
                {errors.fullName && (
                  <span className={styles.errorText}>{errors.fullName}</span>
                )}
              </div>

              {/* EMAIL */}
              <div className="col-md-6">
                <div className={`${styles.inputBox} ${errors.email ? styles.inputError : ""}`}>
                  <FaEnvelope />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="Email"
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              {/* PHONE */}
              <div className="col-md-6">
                <div className={`${styles.inputBox} ${errors.phoneNumber ? styles.inputError : ""}`}>
                  <FaPhoneAlt />
                  <input
                    type="text"
                    name="phoneNumber"        // ✅ fixed: was "mobile"
                    value={form.phoneNumber}  // ✅ controlled
                    placeholder="Mobile Number"
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors.phoneNumber && (
                  <span className={styles.errorText}>{errors.phoneNumber}</span>
                )}
              </div>

              {/* MESSAGE */}
              <div className="col-md-6">
                <div className={`${styles.inputBox} ${errors.message ? styles.inputError : ""}`}>
                  <FaCommentDots />
                  <textarea
                    name="message"        // ✅ fixed: was "query"
                    value={form.message}  // ✅ controlled
                    placeholder="Your Query"
                    rows="1"
                    onChange={handleChange}
                  />
                </div>
                {errors.message && (
                  <span className={styles.errorText}>{errors.message}</span>
                )}
              </div>

            </div>

            {/* API ERROR */}
            {errors.api && (
              <p className={styles.apiError}>{errors.api}</p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}