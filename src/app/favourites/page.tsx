"use client";

import { useRouter } from "next/navigation";
import {
  FiHeart,
  FiMapPin,
  FiShoppingCart,
  FiUser,
  FiArrowLeft,
} from "react-icons/fi";
import { useFavouritesStore } from "@/common/store/favourites/favourites.store";
import styles from "./page.module.css";

const navIcons = [
  {
    label: "Hesabım",
    node: <FiUser className={styles.iconSvg} aria-hidden="true" />,
    href: "/account",
  },
  {
    label: "Siyahılarım",
    node: <FiHeart className={styles.iconSvg} aria-hidden="true" />,
    href: "/favourites",
  },
  {
    label: "Səbətim",
    node: <FiShoppingCart className={styles.iconSvg} aria-hidden="true" />,
    href: "/basket",
  },
];

function resolveImage(img?: string | null): string {
  if (!img || !img.trim()) return "/globe.svg";
  const v = img.trim();
  const invalid = ["null", "undefined", "test", "none", ""];
  if (invalid.includes(v.toLowerCase())) return "/globe.svg";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return v.startsWith("/") ? v : `/${v}`;
  return v.startsWith("/") ? `${base}${v}` : `${base}/${v}`;
}

function formatPrice(value: string | number): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return `${value} AZN`;
  return `${numeric.toFixed(2)} AZN`;
}

export default function FavouritesPage() {
  const router = useRouter();
  const { items, removeFavourite } = useFavouritesStore();

  return (
    <div className={styles.pageShell}>
      <header className={styles.navBand}>
        <div className={styles.topNav}>
          <div className={styles.navLeft}>
            <strong className={styles.brand}>TIK TAK</strong>

            <div className={styles.locationBox}>
              <div className={styles.locationIcon}>
                <FiMapPin size={16} />
              </div>
              <div className={styles.locationMeta}>
                <div className={styles.locationTitle}>Unvan</div>
                <div className={styles.locationAddress}>
                  Adres qeyd olunmayıb
                </div>
              </div>
            </div>
          </div>

          <nav className={styles.navActions} aria-label="Favourites navigation">
            {navIcons.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`${styles.navBtn} ${item.href === "/favourites" ? styles.navBtnActive : ""}`}
                onClick={() => item.href && router.push(item.href)}
              >
                {item.node}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.screen}>
        <div className={styles.favContainer}>
          <div className={styles.favHeader}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => router.back()}
            >
              <FiArrowLeft className={styles.backBtnIcon} />
              <span>Geri qayıt</span>
            </button>
            <h2 className={styles.favTitle}>Siyahılarım</h2>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <FiHeart className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                Hələ heç bir məhsul əlavə etməmisiz
              </p>
              <button
                type="button"
                className={styles.browseBtn}
                onClick={() => router.push("/categories")}
              >
                Məhsullara bax
              </button>
            </div>
          ) : (
            <div className={styles.favGrid}>
              {items.map((product) => (
                <div key={product.id} className={styles.favCard}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFavourite(product.id)}
                    aria-label="Siyahıdan sil"
                  >
                    <FiHeart className={styles.removeBtnIcon} />
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(product.img_url)}
                    alt={product.title}
                    className={styles.favCardImg}
                    width={120}
                    height={120}
                  />

                  <div className={styles.favCardInfo}>
                    <strong className={styles.favCardTitle}>
                      {product.title}
                    </strong>
                    {product.description && (
                      <p className={styles.favCardDesc}>
                        {product.description}
                      </p>
                    )}
                    <span className={styles.favCardPrice}>
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.detailBtn}
                    onClick={() =>
                      router.push(
                        `/categories/${product.id}?category=${product.category?.id || ""}`,
                      )
                    }
                  >
                    Detala bax
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
