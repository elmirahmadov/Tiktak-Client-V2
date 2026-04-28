import { useRouter } from "next/navigation";
import { PriceSummaryCard } from "@/common/components/PriceSummaryCard";
import { formatPriceAzn } from "@/common/utils/productPresentation";
import styles from "../../page.module.css";

type BasketSummaryPanelProps = {
  basketItemsCount: number;
  loading: boolean;
  subtotal: number;
};

export function BasketSummaryPanel({
  basketItemsCount,
  loading,
  subtotal,
}: BasketSummaryPanelProps) {
  const router = useRouter();

  return (
    <aside className={styles.rightPanel}>
      <h3 className={styles.summaryTitle}>Yekun məbləğ</h3>
      <PriceSummaryCard
        action={{
          disabled: loading || basketItemsCount === 0,
          label: "Sifarişi tamamla",
          onClick: () => router.push("/checkout"),
        }}
        classNames={{
          actionButton: styles.checkoutButton,
          card: styles.summaryCard,
          row: styles.summaryRow,
          totalRow: `${styles.summaryRow} ${styles.summaryTotal}`,
        }}
        subtotal={formatPriceAzn(subtotal)}
      />
    </aside>
  );
}
