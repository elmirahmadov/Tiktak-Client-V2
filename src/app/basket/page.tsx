"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IBasketItem } from "@/common/types/api.types";
import { AppHeader } from "@/common/components/AppHeader";
import { BasketItemsSection } from "./components/BasketItemsSection";
import { BasketSummaryPanel } from "./components/BasketSummaryPanel";
import {
  addToBasket,
  decreaseFromBasket,
  getBasket,
  removeAllFromBasket,
} from "@/services/api/basket.api";
import styles from "./page.module.css";

export default function Page() {
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
      <AppHeader
        activeHref="/basket"
        ariaLabel="Basket page navigation"
        searchPlaceholder="Axtarış"
      />

      <main className={styles.screen}>
        <div className={styles.container}>
          <BasketItemsSection
            isMutating={isMutating}
            items={basketItems}
            loading={loading}
            onClearBasket={handleClearBasket}
            onDecrease={handleDecrease}
            onIncrease={handleIncrease}
          />

          <BasketSummaryPanel
            basketItemsCount={basketItems.length}
            loading={loading}
            subtotal={subtotal}
          />
        </div>
      </main>
    </div>
  );
}
