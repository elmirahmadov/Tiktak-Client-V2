"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiMapPin, FiShoppingCart, FiUser } from "react-icons/fi";
import type { IBasketItem } from "@/common/types/api.types";
import {
  addToBasket,
  decreaseFromBasket,
  getBasket,
  removeAllFromBasket,
} from "@/services/api/basket.api";
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
  const value = img.trim();
  const invalidValues = ["null", "undefined", "test", "none", "-"];
  if (invalidValues.includes(value.toLowerCase())) return "/globe.svg";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return value.startsWith("/") ? value : `/${value}`;
  return value.startsWith("/") ? `${base}${value}` : `${base}/${value}`;
}

function formatAmount(value: number): string {
  return `${value.toFixed(2)} AZN`;
}

export default function BasketPage() {
  const router = useRouter();
  const [basketItems, setBasketItems] = useState<IBasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const syncBasket = useCallback(async () => {
    try {
      const basket = await getBasket();
      setBasketItems(basket.items || []);
    } catch (error) {
      console.error("Sebet melumatlari alina bilmedi:", error);
      setBasketItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncBasket();
  }, [syncBasket]);

  const subtotal = useMemo(
    () =>
      basketItems.reduce(
        (acc, item) =>
          acc + (Number(item.product?.price) || 0) * (item.quantity || 0),
        0,
      ),
    [basketItems],
  );

  const handleIncrease = async (productId: number) => {
    try {
      setIsMutating(true);
      await addToBasket(productId, {
        quantity: 1,
        productId: String(productId),
      });
      await syncBasket();
    } catch (error) {
      console.error("Mehsul sebete elave edilmedi:", error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDecrease = async (productId: number, currentQuantity: number) => {
    try {
      setIsMutating(true);
      if (currentQuantity <= 1) {
        await removeAllFromBasket(productId);
      } else {
        await decreaseFromBasket(productId, {
          quantity: 1,
          productId: String(productId),
        });
      }
      await syncBasket();
    } catch (error) {
      console.error("Sebetde mehsul azaldilmadi:", error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleClearBasket = async () => {
    if (basketItems.length === 0) return;

    try {
      setIsMutating(true);
      await Promise.all(
        basketItems.map((item) => removeAllFromBasket(item.product.id)),
      );
      await syncBasket();
    } catch (error) {
      console.error("Sebet temizlenmedi:", error);
    } finally {
      setIsMutating(false);
    }
  };

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

          <div className={styles.searchShell}>
            <input
              type="text"
              className={styles.searchField}
              placeholder="Axtarış"
              aria-label="Axtarış"
            />
          </div>

          <nav
            className={styles.navActions}
            aria-label="Basket page navigation"
          >
            {navIcons.map((item) => (
              <button
                key={item.label}
                type="button"
                className={styles.navBtn}
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
        <div className={styles.container}>
          <section className={styles.leftPanel}>
            <p className={styles.breadcrumb}>Ana səhifə / Meyvələr</p>

            <div className={styles.panelHeader}>
              <h1 className={styles.title}>Səbətim</h1>
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearBasket}
                disabled={isMutating || basketItems.length === 0}
              >
                Səbəti təmizlə
              </button>
            </div>

            <div className={styles.itemsWrap}>
              {loading ? (
                <p className={styles.emptyText}>Səbət yüklənir...</p>
              ) : basketItems.length === 0 ? (
                <p className={styles.emptyText}>Səbətiniz boşdur.</p>
              ) : (
                basketItems.map((item) => (
                  <article key={item.id} className={styles.itemCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImage(item.product?.img_url)}
                      alt={item.product?.title || "Məhsul"}
                      className={styles.itemImage}
                      width={86}
                      height={86}
                    />

                    <div className={styles.itemMeta}>
                      <h2 className={styles.itemTitle}>
                        {item.product?.title || "Məhsul"}
                      </h2>
                      <p className={styles.itemPrice}>
                        {formatAmount(Number(item.product?.price) || 0)}
                      </p>
                    </div>

                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() =>
                          handleDecrease(item.product.id, item.quantity)
                        }
                        disabled={isMutating}
                        aria-label="Miqdarı azalt"
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => handleIncrease(item.product.id)}
                        disabled={isMutating}
                        aria-label="Miqdarı artır"
                      >
                        +
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className={styles.rightPanel}>
            <h3 className={styles.summaryTitle}>Yekun məbləğ</h3>
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span>Ümumi</span>
                <span>{formatAmount(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Çatdırılma</span>
                <span>Pulsuz</span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Yekun məbləğ</span>
                <strong>{formatAmount(subtotal)}</strong>
              </div>

              <button
                type="button"
                className={styles.checkoutButton}
                onClick={() => router.push("/checkout")}
                disabled={loading || basketItems.length === 0}
              >
                Sifarişi tamamla
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
