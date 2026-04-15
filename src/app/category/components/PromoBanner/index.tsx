import Image from "next/image";
import React from "react";
import loginImg from "../../../../../public/tiktak-login.png";
import styles from "./PromoBanner.module.css";

const PromoBanner: React.FC = () => {
  return (
    <aside className={styles.panel}>
      <div className={styles.card}>
        <Image
          src={loginImg.src}
          alt="TikTak promo"
          width={300}
          height={360}
          className={styles.thumbnail}
          style={{ objectFit: "contain" }}
          priority
        />
        <p className={styles.headline}>ONLİNE SİFARİŞ ET</p>
        <div className={styles.countdownRow}>
          <span className={styles.countdownNum}>15</span>
          <span className={styles.countdownLabel}>
            DƏQİQƏYƏ <br /> QAPINDA
          </span>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(PromoBanner);
