import type { KeyboardEvent, ReactNode } from "react";
import {
  formatPriceAzn,
  resolveProductImage,
} from "@/common/utils/productPresentation";
import styles from "./ProductCard.module.css";

type ProductCardItem = {
  id: number;
  title: string;
  price: string | number;
  img_url: string | null;
  description?: string;
};

type ProductCardVariant = "catalog" | "favourite";

type ProductCardProps = {
  product: ProductCardItem;
  variant?: ProductCardVariant;
  active?: boolean;
  onClick?: () => void;
  topAction?: ReactNode;
  footer?: ReactNode;
  showDescription?: boolean;
};

const joinClasses = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

export default function ProductCard({
  product,
  variant = "catalog",
  active = false,
  onClick,
  topAction,
  footer,
  showDescription = false,
}: ProductCardProps) {
  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={joinClasses(
        styles.card,
        styles[variant],
        isInteractive && styles.interactive,
        active && variant === "catalog" && styles.catalogActive,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {topAction ? <div className={styles.topAction}>{topAction}</div> : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveProductImage(product.img_url)}
        alt={product.title}
        className={
          styles[variant === "catalog" ? "catalogImage" : "favouriteImage"]
        }
        width={variant === "catalog" ? 96 : 120}
        height={variant === "catalog" ? 96 : 120}
        loading="lazy"
      />

      <div
        className={
          styles[variant === "catalog" ? "catalogBody" : "favouriteBody"]
        }
      >
        <h3
          className={
            styles[variant === "catalog" ? "catalogTitle" : "favouriteTitle"]
          }
        >
          {product.title}
        </h3>
        {showDescription && product.description ? (
          <p className={styles.description}>{product.description}</p>
        ) : null}
        <p
          className={
            styles[variant === "catalog" ? "catalogPrice" : "favouritePrice"]
          }
        >
          {formatPriceAzn(product.price)}
        </p>
      </div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}
