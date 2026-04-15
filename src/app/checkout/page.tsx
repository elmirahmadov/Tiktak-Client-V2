"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentMethod as CheckoutPaymentMethod } from "@/common/types/api.types";
import type { IBasketItem, IUser } from "@/common/types/api.types";
import { FiHeart, FiMapPin, FiShoppingCart, FiUser } from "react-icons/fi";
import { getBasket } from "@/services/api/basket.api";
import { checkout } from "@/services/api/orders.api";
import { getProfile } from "@/services/api/profile.api";
import ConfirmModal from "./components/ConfirmModal";
import PaymentMethod from "./components/PaymentMethod";
import SuccessPage from "./components/SuccessPage";
import styles from "./page.module.css";

const navIcons = [
  {
    label: "Hesabim",
    node: <FiUser className={styles.iconSvg} aria-hidden="true" />,
    href: "/account",
  },
  {
    label: "Siyahilarim",
    node: <FiHeart className={styles.iconSvg} aria-hidden="true" />,
  },
  {
    label: "Sebetim",
    node: <FiShoppingCart className={styles.iconSvg} aria-hidden="true" />,
    href: "/basket",
  },
];

function formatAmount(value: number): string {
  return `${value.toFixed(2)} AZN`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [profile, setProfile] = useState<IUser | null>(null);
  const [basketItems, setBasketItems] = useState<IBasketItem[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    CheckoutPaymentMethod.CASH
  );

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const [profileRes, basketRes] = await Promise.allSettled([
          getProfile(),
          getBasket(),
        ]);

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value);
        }

        if (basketRes.status === "fulfilled") {
          setBasketItems(basketRes.value.items || []);
        }
      } catch (error) {
        console.error("Checkout data yuklenmedi:", error);
      }
    };

    loadCheckoutData();
  }, []);

  const subtotal = useMemo(
    () =>
      basketItems.reduce(
        (acc, item) => acc + (Number(item.product?.price) || 0) * (item.quantity || 0),
        0
      ),
    [basketItems]
  );
  const discount = 0;
  const total = subtotal - discount;

  const handleConfirmOrder = async () => {
    const address = profile?.address || "Ünvan qeyd olunmayıb";
    const phone = profile?.phone || "";

    if (!phone.trim()) {
      alert("Telefon nömrəsi tapılmadı.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      await checkout({
        paymentMethod,
        address,
        phone,
        note,
      });
      setIsConfirmModalOpen(false);
      setIsOrderConfirmed(true);
    } catch (error) {
      console.error("Checkout xetasi:", error);
      alert("Sifariş tamamlanmadı. Zəhmət olmasa yenidən yoxlayın.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className={styles.pageShell}>
      {isConfirmModalOpen && (
        <ConfirmModal
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmOrder}
          loading={isSubmittingOrder}
        />
      )}

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
                <div className={styles.locationAddress}>57 Azadliq pr-ti, Baki</div>
              </div>
            </div>
          </div>

          <div className={styles.searchShell}>
            <input
              type="text"
              className={styles.searchField}
              placeholder="Axtaris"
              aria-label="Axtaris"
            />
          </div>

          <nav className={styles.navActions} aria-label="Checkout page navigation">
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
          {isOrderConfirmed ? (
            <SuccessPage />
          ) : (
            <>
              <p className={styles.breadcrumb}>Ana sehife / Meyveler</p>

              <div className={styles.headingRow}>
                <h1 className={styles.pageTitle}>Sifarisin tamamlanmasi</h1>
                <h2 className={styles.summaryTitle}>Xulase</h2>
              </div>

              <div className={styles.contentGrid}>
                <section className={styles.leftPanel}>
                  <div className={styles.infoGrid}>
                    <div>
                      <h3 className={styles.blockTitle}>Adınız</h3>
                      <p className={styles.blockValue}>{profile?.full_name || "-"}</p>

                      <h3 className={styles.blockTitle}>Ünvanınız</h3>
                      <p className={styles.blockValue}>{profile?.address || "Ünvan qeyd olunmayıb"}</p>

                      <h3 className={styles.blockTitle}>Telefon nömrəniz</h3>
                      <p className={styles.blockValue}>{profile?.phone || "-"}</p>
                    </div>

                    <div>
                      <label className={styles.blockTitle} htmlFor="checkout-note">
                        Əlavə qeyd
                      </label>
                      <textarea
                        id="checkout-note"
                        className={styles.noteInput}
                        placeholder="Qapıya qədər park kodu, bina girişi və qeyd"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <PaymentMethod
                    onComplete={(method) => {
                      setPaymentMethod(
                        method === "card"
                          ? CheckoutPaymentMethod.CARD
                          : CheckoutPaymentMethod.CASH
                      );
                      setIsConfirmModalOpen(true);
                    }}
                  />
                </section>

                <aside className={styles.summaryPanel}>
                  <div className={styles.summaryList}>
                    {basketItems.map((item) => (
                      <div key={item.id} className={styles.summaryLine}>
                        <span>
                          {item.quantity} x {item.product?.title || "Məhsul"}
                        </span>
                        <strong>
                          {formatAmount((Number(item.product?.price) || 0) * (item.quantity || 0))}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className={styles.summaryTotals}>
                    <div className={styles.totalLine}>
                      <span>Ümumi:</span>
                      <span>{formatAmount(subtotal)}</span>
                    </div>
                    <div className={styles.totalLine}>
                      <span>Çatdırılma:</span>
                      <span>Pulsuz</span>
                    </div>
                    <div className={`${styles.totalLine} ${styles.totalStrong}`}>
                      <span>Yekun məbləğ</span>
                      <span>{formatAmount(total)}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
