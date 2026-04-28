"use client";

import { useEffect, useMemo, useState } from "react";
import { PaymentMethod as CheckoutPaymentMethod } from "@/common/types/api.types";
import type { IBasketItem, IUser } from "@/common/types/api.types";
import { AppHeader } from "@/common/components/AppHeader";
import { getBasket } from "@/services/api/basket.api";
import { checkout } from "@/services/api/orders.api";
import { getProfile } from "@/services/api/profile.api";
import AddressInfo from "./components/AddressInfo";
import ConfirmModal from "./components/ConfirmModal";
import OrderSummary from "./components/OrderSummary";
import PaymentMethod from "./components/PaymentMethod";
import SuccessPage from "./components/SuccessPage";
import styles from "./page.module.css";

export default function Page() {
  const [note, setNote] = useState("");
  const [profile, setProfile] = useState<IUser | null>(null);
  const [basketItems, setBasketItems] = useState<IBasketItem[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    CheckoutPaymentMethod.CASH,
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
        (acc, item) =>
          acc + (Number(item.product?.price) || 0) * (item.quantity || 0),
        0,
      ),
    [basketItems],
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
      {isConfirmModalOpen ? (
        <ConfirmModal
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmOrder}
          loading={isSubmittingOrder}
        />
      ) : null}

      <AppHeader
        ariaLabel="Checkout page navigation"
        locationAddress="57 Azadliq pr-ti, Baki"
        searchPlaceholder="Axtaris"
      />

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
                  <AddressInfo
                    note={note}
                    onNoteChange={setNote}
                    profile={profile}
                  />

                  <PaymentMethod
                    onComplete={(method) => {
                      setPaymentMethod(
                        method === "card"
                          ? CheckoutPaymentMethod.CARD
                          : CheckoutPaymentMethod.CASH,
                      );
                      setIsConfirmModalOpen(true);
                    }}
                  />
                </section>

                <OrderSummary
                  basketItems={basketItems}
                  subtotal={subtotal}
                  total={total}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
