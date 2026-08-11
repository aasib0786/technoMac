import styles from "./AttractiveLoader.module.css";

export default function AttractiveLoader({ size = "md", text = "", fullHeight = false }) {
  return (
    <div className={`${styles.loaderWrapper} ${fullHeight ? styles.fullscreen : ""}`}>
      <div className={styles.containerBox}>
        <div className={`${styles.spinnerRing} ${styles[size] || styles.md}`}>
          <div className={styles.outerRing} />
          <div className={styles.innerRing} />
          <div className={styles.centerDot} />
        </div>
        {text && <p className={styles.loaderText}>{text}</p>}
      </div>
    </div>
  );
}
