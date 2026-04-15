import styles from "./SuccessPage.module.css";

export default function SuccessPage() {
  return (
    <section className={styles.successPanel}>
      <div className={styles.successIconWrap} aria-hidden="true">
        <div className={styles.successIconCircle}>
          <span className={styles.successCheck} />
        </div>
      </div>
      <h2 className={styles.successTitle}>Sifariş uğurla tamamlandı</h2>
      <p className={styles.successText}>
        Əməkdaşlarımız sizinlə əlaqə saxlayıb sifarişinizi göndərəcəklər.
      </p>
    </section>
  );
}
