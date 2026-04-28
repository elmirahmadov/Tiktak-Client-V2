import {
  formatPriceAzn,
  resolveProductImage,
} from "@/common/utils/productPresentation";
import styles from "../../page.module.css";

type BasketSidebarItem = {
  qty: number;
  product: {
    id: number;
    title: string;
    price: string | number;
    img_url: string | null;
  };
};

type BasketSidebarProps = {
  items: BasketSidebarItem[];
  total: number;
  onCheckout: () => void;
  onDecrease: (productId: number) => void;
  onIncrease: (productId: number) => void;
  onRemove: (productId: number) => void;
};

export default function BasketSidebar({
  items,
  total,
  onCheckout,
  onDecrease,
  onIncrease,
  onRemove,
}: BasketSidebarProps) {
  return (
    <aside className={styles.rightColumn}>
      <h3 className={styles.detailHeading}>Səbətim</h3>
      {items.length === 0 ? (
        <div className={styles.basketCard}>
          <div className={styles.emptyBasketVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/empty-basket.svg"
              alt="Boş səbət"
              className={styles.emptyBasketIllustration}
            />
          </div>
          <p className={styles.emptyBasketTitle}>Səbətiniz boşdur</p>
          <p className={styles.emptyBasketText}>
            Sifariş vermək üçün səbətinizə məhsul əlavə edin
          </p>
        </div>
      ) : (
        <div className={styles.basketCard}>
          <div className={styles.basketItemsList}>
            {items.map((item) => (
              <div key={item.product.id} className={styles.basketItemRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveProductImage(item.product.img_url)}
                  alt={item.product.title}
                  className={styles.basketItemImg}
                  width={42}
                  height={42}
                />
                <div className={styles.basketItemMain}>
                  <strong className={styles.basketItemName}>
                    {item.product.title} {item.qty} kq
                  </strong>
                  <div className={styles.basketQtyRow}>
                    <button
                      type="button"
                      className={`${styles.qtyBtn} ${styles.qtyBtnMinus}`}
                      onClick={() => onDecrease(item.product.id)}
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`}
                      onClick={() => onIncrease(item.product.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.basketItemSide}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemove(item.product.id)}
                    aria-label="Səbətdən sil"
                  >
                    🗑
                  </button>
                  <span>
                    {formatPriceAzn(
                      (Number(item.product.price) || 0) * item.qty,
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.basketTotals}>
            <div className={styles.totalRow}>
              <span>Ümumi:</span>
              <span>{formatPriceAzn(total)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Çatdırılma:</span>
              <span>Pulsuz</span>
            </div>
            <div className={`${styles.totalRow} ${styles.totalMain}`}>
              <span>Yekun məbləğ:</span>
              <strong>{formatPriceAzn(total)}</strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.checkoutBtn}
            onClick={onCheckout}
          >
            Sifarişi tamamla
          </button>
        </div>
      )}
    </aside>
  );
}
