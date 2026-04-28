import type { ReactNode } from "react";

type SummaryItem = {
  id: string;
  label: ReactNode;
  value: ReactNode;
};

type SummaryTotal = {
  label: ReactNode;
  value: ReactNode;
};

type PriceSummaryCardClassNames = {
  actionButton?: string;
  card: string;
  itemLine?: string;
  itemsList?: string;
  row: string;
  totalRow?: string;
};

type PriceSummaryCardProps = {
  action?: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
  };
  classNames: PriceSummaryCardClassNames;
  items?: SummaryItem[];
  subtotal: ReactNode;
  total?: SummaryTotal;
};

export function PriceSummaryCard({
  action,
  classNames,
  items,
  subtotal,
  total,
}: PriceSummaryCardProps) {
  const resolvedTotal = total ?? {
    label: "Yekun məbləğ",
    value: subtotal,
  };

  return (
    <div className={classNames.card}>
      {items && items.length > 0 ? (
        <div className={classNames.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={classNames.itemLine}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

      <div className={classNames.row}>
        <span>Ümumi</span>
        <span>{subtotal}</span>
      </div>
      <div className={classNames.row}>
        <span>Çatdırılma</span>
        <span>Pulsuz</span>
      </div>

      <div className={classNames.totalRow ?? classNames.row}>
        <span>{resolvedTotal.label}</span>
        <strong>{resolvedTotal.value}</strong>
      </div>

      {action ? (
        <button
          type="button"
          className={classNames.actionButton}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
