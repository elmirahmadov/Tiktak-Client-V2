import type { ICategory } from "@/common/types/api.types";
import styles from "../../page.module.css";

type CategorySidebarProps = {
  activeCategoryId: number | null;
  categories: ICategory[];
  onSelectCategory: (categoryId: number) => void;
};

export default function CategorySidebar({
  activeCategoryId,
  categories,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className={styles.leftColumn}>
      <p className={styles.crumb}>Ana səhifə / Kateqoriya məhsulları</p>
      <h2 className={styles.title}>Kateqoriyalar</h2>

      <div className={styles.categoryPanel}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`${styles.categoryButton} ${
              activeCategoryId === category.id
                ? styles.categoryButtonActive
                : ""
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className={styles.promoTile}>
        <strong className={styles.promoHeadline}>
          MEYVƏLƏRƏ
          <br />
          ENDİRİM
        </strong>
      </div>
    </aside>
  );
}
