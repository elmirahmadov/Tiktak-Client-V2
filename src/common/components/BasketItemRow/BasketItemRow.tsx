import { formatPriceAzn } from "@/common/utils/productPresentation";

type BasketItemRowClassNames = {
  image: string;
  meta: string;
  price: string;
  qtyButton: string;
  qtyControl: string;
  qtyValue: string;
  title: string;
  wrapper: string;
};

type BasketItemRowProps = {
  alt: string;
  classNames: BasketItemRowClassNames;
  disabled?: boolean;
  imageSrc: string;
  onDecrease: () => void;
  onIncrease: () => void;
  price: number;
  quantity: number;
  title: string;
};

export function BasketItemRow({
  alt,
  classNames,
  disabled = false,
  imageSrc,
  onDecrease,
  onIncrease,
  price,
  quantity,
  title,
}: BasketItemRowProps) {
  return (
    <article className={classNames.wrapper}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className={classNames.image}
        width={86}
        height={86}
      />

      <div className={classNames.meta}>
        <h2 className={classNames.title}>{title}</h2>
        <p className={classNames.price}>{formatPriceAzn(price)}</p>
      </div>

      <div className={classNames.qtyControl}>
        <button
          type="button"
          className={classNames.qtyButton}
          onClick={onDecrease}
          disabled={disabled}
          aria-label="Miqdarı azalt"
        >
          -
        </button>
        <span className={classNames.qtyValue}>{quantity}</span>
        <button
          type="button"
          className={classNames.qtyButton}
          onClick={onIncrease}
          disabled={disabled}
          aria-label="Miqdarı artır"
        >
          +
        </button>
      </div>
    </article>
  );
}
