"use client";

import { useEffect, useState } from "react";
import styles from "./ConfirmModal.module.css";

type ConfirmModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function ConfirmModal({ onClose, onConfirm, loading = false }: ConfirmModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(179);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.confirmModal} role="dialog" aria-modal="true">
        <div className={styles.clockWrap} aria-hidden="true">
          <div className={styles.clockGlow} />
          <div className={styles.clockFace}>
            <span className={`${styles.clockHand} ${styles.clockHandHour}`} />
            <span className={`${styles.clockHand} ${styles.clockHandMinute}`} />
            <span className={styles.clockCenter} />
          </div>
          <span className={styles.clockLeafOne} />
          <span className={styles.clockLeafTwo} />
        </div>

        <h3 className={styles.modalTitle}>Sifarişinizi təsdiqləyiniz</h3>
        <p className={styles.modalText}>vaxtın bitməsinə {formatted} qaldı</p>

        <div className={styles.modalActions}>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? "Gözləyin..." : "Təsdiqlə"}
          </button>
          <button type="button" className={styles.laterBtn} onClick={onClose} disabled={loading}>
            İndi yox
          </button>
        </div>
      </div>
    </div>
  );
}
