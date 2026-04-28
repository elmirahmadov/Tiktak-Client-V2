import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToBasket,
  decreaseFromBasket,
  getBasket,
  removeAllFromBasket,
} from "@/services/api/basket.api";

type BasketProductLike = {
  id: number;
  price: string | number;
};

type BasketItem<TProduct extends BasketProductLike> = {
  product: TProduct;
  qty: number;
};

export function useBasketQuantities<TProduct extends BasketProductLike>(
  products: TProduct[],
) {
  const [basketQuantities, setBasketQuantities] = useState<
    Record<number, number>
  >({});

  const syncBasketFromApi = useCallback(async () => {
    try {
      const basket = await getBasket();
      const qtyMap = (basket.items || []).reduce<Record<number, number>>(
        (acc, item) => {
          if (item.product?.id) {
            acc[item.product.id] = item.quantity || 0;
          }
          return acc;
        },
        {},
      );
      setBasketQuantities(qtyMap);
    } catch (error) {
      console.error("Sebet melumatlari alina bilmedi:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncBasketFromApi();
    }, 0);

    return () => clearTimeout(timer);
  }, [syncBasketFromApi]);

  const increaseQty = useCallback(
    async (id: number, quantity = 1) => {
      try {
        await addToBasket(id, {
          quantity,
          productId: String(id),
        });
        await syncBasketFromApi();
      } catch (error) {
        console.error("Mehsul sebete elave edilmedi:", error);
      }
    },
    [syncBasketFromApi],
  );

  const decreaseQty = useCallback(
    async (id: number) => {
      try {
        const currentQty = basketQuantities[id] || 0;
        if (currentQty <= 1) {
          await removeAllFromBasket(id);
        } else {
          await decreaseFromBasket(id, {
            quantity: 1,
            productId: String(id),
          });
        }
        await syncBasketFromApi();
      } catch (error) {
        console.error("Sebetde mehsul azaldilmadi:", error);
      }
    },
    [basketQuantities, syncBasketFromApi],
  );

  const removeFromBasket = useCallback(
    async (id: number) => {
      try {
        await removeAllFromBasket(id);
        await syncBasketFromApi();
      } catch (error) {
        console.error("Mehsul sebetden silinmedi:", error);
      }
    },
    [syncBasketFromApi],
  );

  const basketItems = useMemo<Array<BasketItem<TProduct>>>(() => {
    return products
      .filter((product) => (basketQuantities[product.id] || 0) > 0)
      .map((product) => ({
        product,
        qty: basketQuantities[product.id],
      }));
  }, [products, basketQuantities]);

  const basketTotal = useMemo(() => {
    return basketItems.reduce((sum, item) => {
      const price = Number(item.product.price) || 0;
      return sum + price * item.qty;
    }, 0);
  }, [basketItems]);

  return {
    basketItems,
    basketQuantities,
    basketTotal,
    decreaseQty,
    increaseQty,
    removeFromBasket,
    syncBasketFromApi,
  };
}
