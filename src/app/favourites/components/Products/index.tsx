import { useRouter } from "next/navigation";
import { FiHeart } from "react-icons/fi";
import { ProductCard } from "@/common/components/ProductCard";
import type { IProduct } from "@/common/types/api.types";
import categoryStyles from "@/app/categories/page.module.css";
import styles from "../../page.module.css";

type ProductsProps = {
  items: IProduct[];
  onRemoveFavourite: (productId: number) => void;
};

export default function Products({ items, onRemoveFavourite }: ProductsProps) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FiHeart className={styles.emptyIcon} />
        <p className={styles.emptyText}>Hələ heç bir məhsul əlavə etməmisiz</p>
        <button
          type="button"
          className={styles.browseBtn}
          onClick={() => router.push("/categories")}
        >
          Məhsullara bax
        </button>
      </div>
    );
  }

  return (
    <div className={styles.favGrid}>
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="catalog"
          onClick={() =>
            router.push(
              `/categories?${new URLSearchParams({
                ...(product.category?.id
                  ? { category: String(product.category.id) }
                  : {}),
                productId: String(product.id),
              }).toString()}`,
            )
          }
          topAction={
            <button
              type="button"
              className={styles.removeBtn}
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFavourite(product.id);
              }}
              aria-label="Siyahıdan sil"
            >
              <FiHeart className={styles.removeBtnIcon} />
            </button>
          }
          footer={
            <button
              type="button"
              className={categoryStyles.addBtnCard}
              onClick={(event) => {
                event.stopPropagation();
                router.push(
                  `/categories?${new URLSearchParams({
                    ...(product.category?.id
                      ? { category: String(product.category.id) }
                      : {}),
                    productId: String(product.id),
                  }).toString()}`,
                );
              }}
            >
              Səbətə əlavə et
            </button>
          }
        />
      ))}
    </div>
  );
}
