import type { IBasketItem } from "@/common/types/api.types";
import { BasketItemRow } from "@/common/components/BasketItemRow";
import { resolveProductImage } from "@/common/utils/productPresentation";
import styles from "../../page.module.css";

type BasketItemsSectionProps = {
  isMutating: boolean;
  items: IBasketItem[];
  loading: boolean;
  onClearBasket: () => void;
  onDecrease: (productId: number, currentQuantity: number) => void;
  onIncrease: (productId: number) => void;
};

export function BasketItemsSection({
  isMutating,
  items,
  loading,
  onClearBasket,
  onDecrease,
  onIncrease,
}: BasketItemsSectionProps) {
  return (
    <section className={styles.leftPanel}>
      <p className={styles.breadcrumb}>Ana səhifə / Meyvələr</p>

      <div className={styles.panelHeader}>
        <h1 className={styles.title}>Səbətim</h1>
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClearBasket}
          disabled={isMutating || items.length === 0}
        >
          Səbəti təmizlə
        </button>
      </div>

      <div className={styles.itemsWrap}>
        {loading ? (
          <p className={styles.emptyText}>Səbət yüklənir...</p>
        ) : items.length === 0 ? (
          <p className={styles.emptyText}>Səbətiniz boşdur.</p>
        ) : (
          items.map((item) => (
            <BasketItemRow
              key={item.id}
              alt={item.product?.title || "Məhsul"}
              classNames={{
                image: styles.itemImage,
                meta: styles.itemMeta,
                price: styles.itemPrice,
                qtyButton: styles.qtyButton,
                qtyControl: styles.qtyControl,
                qtyValue: styles.qtyValue,
                title: styles.itemTitle,
                wrapper: styles.itemCard,
              }}
              disabled={isMutating}
              imageSrc={resolveProductImage(item.product?.img_url)}
              onDecrease={() => onDecrease(item.product.id, item.quantity)}
              onIncrease={() => onIncrease(item.product.id)}
              price={Number(item.product?.price) || 0}
              quantity={item.quantity}
              title={item.product?.title || "Məhsul"}
            />
          ))
        )}
      </div>
    </section>
  );
}
