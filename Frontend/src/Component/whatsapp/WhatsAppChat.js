import React, { useEffect, useState } from "react";
import styles from "./WhatsAppChat.module.css";
import { getData } from "../../services/FetchNodeServices";

const PLACEHOLDER_TEXT = "Type your message here...";
const PHONE_NUMBER = "919311125574";

// ── Inline SVGs — no Bootstrap Icons needed ──
const WhatsAppSVG = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.824.737 5.469 2.027 7.77L0 32l8.437-2.01A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.771-1.854l-.485-.29-5.01 1.194 1.237-4.882-.317-.502A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.355-1.162-2.72-1.295-.366-.133-.632-.199-.899.199-.266.398-1.032 1.295-1.265 1.561-.233.266-.466.299-.864.1-.398-.2-1.681-.62-3.202-1.977-1.183-1.056-1.982-2.36-2.215-2.758-.233-.398-.025-.613.175-.811.18-.178.398-.466.597-.699.2-.233.266-.398.399-.664.133-.266.066-.499-.033-.698-.1-.2-.9-2.163-1.232-2.963-.325-.778-.655-.673-.9-.686l-.765-.013c-.266 0-.698.1-1.064.499-.366.398-1.397 1.362-1.397 3.325s1.43 3.857 1.63 4.123c.198.266 2.815 4.297 6.823 6.027.953.412 1.697.658 2.277.842.956.305 1.827.262 2.515.159.767-.114 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.1-.166-.366-.266-.764-.465z"/>
  </svg>
);

const HeadsetSVG = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12v3a3 3 0 003 3h1a1 1 0 001-1v-4a1 1 0 00-1-1H4.062A8 8 0 0120 12h-2a1 1 0 00-1 1v4a1 1 0 001 1h1c.35 0 .686-.06 1-.17V18a3 3 0 01-3 3h-2a1 1 0 000 2h2a5 5 0 005-5v-.17A3 3 0 0022 15v-3c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const SendSVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const WhatsAppChat = () => {
  const [open, setOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [message, setMessage] = useState("");

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

  /* ── Typing Effect ── */
  useEffect(() => {
    if (!open) {
      setPlaceholder("");
      setCharIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCharIndex((prev) => {
        const next = prev >= PLACEHOLDER_TEXT.length ? 0 : prev + 1;
        setPlaceholder(PLACEHOLDER_TEXT.slice(0, next));
        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [open]);

  /* ── Send to WhatsApp ── */
  const sendToWhatsApp = () => {
    if (!message.trim()) return;
    const url = `https://wa.me/${contactInfo.whatsappPhone}?text=${encodeURIComponent(message.trim())}`;
    window.open(url, "_blank");
    setMessage("");
    setOpen(false);
  };

  /* ── Enter to send, Shift+Enter for newline ── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendToWhatsApp();
    }
  };

  return (
    <>
      {/* CHAT BOX */}
      {open && (
        <div className={styles.waChatBox}>

          {/* Header */}
          <div className={styles.waHeader}>
            <div className={styles.waHeaderLeft}>
              <div className={styles.waAvatar}>
                <HeadsetSVG />
              </div>
              <div className={styles.waHeaderInfo}>
                <span>Chat with us</span>
                <span className={styles.waOnline}>● Online</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          {/* Body */}
          <div className={styles.waBody}>
            <div className={styles.waBubble}>
              👋 Hi there! How can we help you today?
            </div>
            <div className={styles.waInputWrapper}>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Type a message..."}
                className={styles.waTextarea}
              />
              <button
                className={styles.waSendBtn}
                onClick={sendToWhatsApp}
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <SendSVG />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* FLOATING ICON */}
      <div
        className={`${styles.waFloatingIcon} ${open ? styles.waFloatingIconOpen : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        role="button"
        aria-label="Open WhatsApp chat"
      >
        <div className={`${styles.waIconInner} ${open ? styles.waIconRotate : ""}`}>
          {open ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <WhatsAppSVG />
          )}
        </div>
      </div>
    </>
  );
};

export default WhatsAppChat;