import type { IProduct } from "@/common/types/api.types";
import {
  formatPriceAzn,
  resolveProductImage,
} from "@/common/utils/productPresentation";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import styles from "../../page.module.css";

type ProductDetailPanelProps = {
  displayQty: number;
  inBasket: boolean;
  isFavourite: boolean;
  product: IProduct;
  onAddToBasket: () => void;
  onBack: () => void;
  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  onToggleFavourite: () => void;
};

export default function ProductDetailPanel({
  displayQty,
  inBasket,
  isFavourite,
  product,
  onAddToBasket,
  onBack,
  onDecreaseQty,
  onIncreaseQty,
  onToggleFavourite,
}: ProductDetailPanelProps) {
  return (
    <article className={styles.detailCard}>
      <div className={styles.detailTopRow}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <FiArrowLeft className={styles.backBtnIcon} aria-hidden="true" />
          <span>Geri qayıt</span>
        </button>

        <button
          type="button"
          className={styles.favoriteBtn}
          onClick={onToggleFavourite}
          aria-label={isFavourite ? "Siyahıdan sil" : "Siyahıya əlavə et"}
        >
          <FiHeart
            style={isFavourite ? { fill: "#e53e3e", stroke: "#e53e3e" } : {}}
          />
        </button>
      </div>

      <div className={styles.detailBody}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveProductImage(product.img_url)}
          alt={product.title}
          className={styles.detailImage}
          width={360}
          height={360}
        />

        <div className={styles.detailInfo}>
          <h3 className={styles.detailTitle}>{product.title}</h3>
          <p className={styles.detailText}>
            {product.description ||
              "Məhsul haqqında qısa məlumat. API-dən təsvir gələndə burada görünəcək."}
          </p>
          <p className={styles.detailPrice}>{formatPriceAzn(product.price)}</p>

          <div className={styles.detailQtyRow}>
            <button
              type="button"
              className={styles.detailQtyBtn}
              onClick={onDecreaseQty}
              disabled={!inBasket && displayQty <= 1}
            >
              -
            </button>
            <span className={styles.detailQtyValue}>{displayQty} kq</span>
            <button
              type="button"
              className={styles.detailQtyBtn}
              onClick={onIncreaseQty}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={styles.addBtn}
            onClick={onAddToBasket}
            disabled={inBasket}
            style={
              inBasket
                ? {
                    background: "#b2e09a",
                    cursor: "not-allowed",
                  }
                : undefined
            }
          >
            {inBasket ? "Səbətdə" : "Səbətə əlavə et"}
          </button>
        </div>
      </div>
    </article>
  );
}
