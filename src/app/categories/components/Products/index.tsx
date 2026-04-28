import { ProductCard } from "@/common/components/ProductCard";
import type { IProduct } from "@/common/types/api.types";
import styles from "../../page.module.css";

type ProductsProps = {
  activeProductId: number | null;
  basketQuantities: Record<number, number>;
  onDecreaseQty: (productId: number) => void;
  onIncreaseQty: (productId: number) => void;
  onOpenProduct: (productId: number) => void;
  products: IProduct[];
  productsError: string | null;
  productsLoading: boolean;
};

export default function Products({
  activeProductId,
  basketQuantities,
  onDecreaseQty,
  onIncreaseQty,
  onOpenProduct,
  products,
  productsError,
  productsLoading,
}: ProductsProps) {
  return (
    <section className={styles.centerColumn}>
      {productsLoading ? (
        <p className={styles.message}>Məhsullar yüklənir...</p>
      ) : productsError ? (
        <p className={styles.messageError}>{productsError}</p>
      ) : products.length === 0 ? (
        <p className={styles.message}>Bu kateqoriyada məhsul tapılmadı.</p>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="catalog"
              active={activeProductId === product.id}
              onClick={() => onOpenProduct(product.id)}
              footer={
                (basketQuantities[product.id] || 0) > 0 ? (
                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={`${styles.qtyBtn} ${styles.qtyBtnMinus}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDecreaseQty(product.id);
                      }}
                    >
                      -
                    </button>
                    <div className={styles.qtyCombo}>
                      <span className={styles.qtyBadge}>
                        {basketQuantities[product.id]} kq
                      </span>
                      <button
                        type="button"
                        className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onIncreaseQty(product.id);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.addBtnCard}
                    onClick={(event) => {
                      event.stopPropagation();
                      onIncreaseQty(product.id);
                    }}
                  >
                    Səbətə əlavə et
                  </button>
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
