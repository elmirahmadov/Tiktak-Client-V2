import type { IBasketItem } from "@/common/types/api.types";
import { PriceSummaryCard } from "@/common/components/PriceSummaryCard";
import { formatPriceAzn } from "@/common/utils/productPresentation";
import styles from "../../page.module.css";

type OrderSummaryProps = {
  basketItems: IBasketItem[];
  subtotal: number;
  total: number;
};

export default function OrderSummary({
  basketItems,
  subtotal,
  total,
}: OrderSummaryProps) {
  return (
    <aside className={styles.summaryPanel}>
      <PriceSummaryCard
        classNames={{
          card: styles.summaryTotals,
          itemLine: styles.summaryLine,
          itemsList: styles.summaryList,
          row: styles.totalLine,
          totalRow: `${styles.totalLine} ${styles.totalStrong}`,
        }}
        items={basketItems.map((item) => ({
          id: String(item.id),
          label: `${item.quantity} x ${item.product?.title || "Məhsul"}`,
          value: formatPriceAzn(
            (Number(item.product?.price) || 0) * (item.quantity || 0),
          ),
        }))}
        subtotal={formatPriceAzn(subtotal)}
        total={{
          label: "Yekun məbləğ",
          value: formatPriceAzn(total),
        }}
      />
    </aside>
  );
}
