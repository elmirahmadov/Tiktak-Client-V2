"use client";

import { useState } from "react";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { FiCreditCard } from "react-icons/fi";
import styles from "./PaymentMethod.module.css";

type PaymentMethodProps = {
  onComplete: (method: Method) => void;
};

type Method = "cash" | "card";

export default function PaymentMethod({ onComplete }: PaymentMethodProps) {
  const [method, setMethod] = useState<Method>("cash");

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.blockTitle}>Ödəmə metodu seçin:</h3>

      <div className={styles.paymentOptions}>
        <label className={`${styles.paymentOption} ${method === "cash" ? styles.active : ""}`}>
          <input
            type="radio"
            name="payment"
            checked={method === "cash"}
            onChange={() => setMethod("cash")}
          />
          <span className={styles.paymentContent}>
            <span className={`${styles.paymentIconWrap} ${styles.paymentIconCash}`}>
              <HiOutlineBanknotes className={styles.paymentIcon} aria-hidden="true" />
            </span>
            <span className={styles.paymentLabel}>Qapıda nəğd ödəmə</span>
          </span>
          <span className={styles.paymentDot} />
        </label>

        <label className={`${styles.paymentOption} ${method === "card" ? styles.active : ""}`}>
          <input
            type="radio"
            name="payment"
            checked={method === "card"}
            onChange={() => setMethod("card")}
          />
          <span className={styles.paymentContent}>
            <span className={styles.paymentIconWrap}>
              <FiCreditCard className={styles.paymentIcon} aria-hidden="true" />
            </span>
            <span className={styles.paymentLabel}>Qapıda kart ilə ödəmə</span>
          </span>
          <span className={styles.paymentDot} />
        </label>
      </div>

      <button type="button" className={styles.completeBtn} onClick={() => onComplete(method)}>
        Sifarişi tamamla
      </button>
    </div>
  );
}
