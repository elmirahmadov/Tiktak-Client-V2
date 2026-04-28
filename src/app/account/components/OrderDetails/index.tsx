import { useEffect, useState } from "react";
import { formatPriceAzn } from "@/common/utils/productPresentation";
import {
  formatOrderAddress,
  formatOrderDateTime,
  formatOrderIdentifier,
} from "@/common/utils/orderPresentation";
import { getOrderDetail, type IOrderDetail } from "@/services/api/orders.api";
import styles from "../../page.module.css";

type OrderDetailsProps = {
  orderId: string;
};

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<IOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrderDetail = async () => {
      setIsLoading(true);
      setErrorText("");

      if (!orderId) {
        if (isMounted) {
          setOrder(null);
          setErrorText("Sifariş identifikatoru tapılmadı.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getOrderDetail(orderId);
        if (isMounted) {
          if (!data) {
            setOrder(null);
            setErrorText("Sifariş detalı tapılmadı.");
          } else {
            setOrder(data);
          }
        }
      } catch {
        if (isMounted) {
          setErrorText("Sifariş detalları yüklənmədi.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return (
    <section className={styles.orderDetailCard}>
      <div className={styles.orderDetailSummary}>
        <div className={styles.orderSummaryItem}>
          <span className={styles.orderSummaryValue}>Sifariş nömrəsi</span>
          <span className={styles.orderSummaryLabel}>
            {formatOrderIdentifier(order?.id || orderId, order?.orderNumber)}
          </span>
        </div>
        <div className={styles.orderSummaryItem}>
          <span className={styles.orderSummaryValue}>Sifariş tarixi</span>
          <span className={styles.orderSummaryLabel}>
            {formatOrderDateTime(order?.createdAt || "")}
          </span>
        </div>
        <div className={styles.orderSummaryItem}>
          <span className={styles.orderSummaryValue}>Çatdırılma ünvanı</span>
          <span className={styles.orderSummaryLabel}>
            {formatOrderAddress(order?.address)}
          </span>
        </div>
        <div className={styles.orderSummaryItem}>
          <span className={styles.orderSummaryValue}>Sifariş statusu</span>
          <span className={styles.orderSummaryLabel}>
            {order?.status || "-"}
          </span>
        </div>
        <div className={styles.orderSummaryItem}>
          <span className={styles.orderSummaryValue}>Telefon nömrəsi</span>
          <span className={styles.orderSummaryLabel}>
            {order?.phone || "-"}
          </span>
        </div>
        <div className={styles.orderSummaryItem}>
          <span className={styles.orderSummaryValue}>Subtotal/Çatdırılma</span>
          <span className={styles.orderSummaryLabel}>
            {`${formatPriceAzn(order?.totalPrice || 0)} / Pulsuz`}
          </span>
        </div>
      </div>

      <h3 className={styles.productsTitle}>Məhsullar</h3>
      <div className={styles.orderProducts}>
        {isLoading ? (
          <p className={styles.ordersState}>Sifariş detalları yüklənir...</p>
        ) : null}

        {!isLoading && errorText ? (
          <p className={`${styles.ordersState} ${styles.ordersStateError}`}>
            {errorText}
          </p>
        ) : null}

        {!isLoading && !errorText && (!order || order.items.length === 0) ? (
          <p className={styles.ordersState}>Bu sifarişdə məhsul tapılmadı.</p>
        ) : null}

        {!isLoading && !errorText
          ? order?.items.map((product) => (
              <div key={product.id} className={styles.productRow}>
                <div className={styles.productInfo}>
                  <div className={styles.productImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imgUrl || "/images/no-image.png"}
                      alt={product.title}
                      width={40}
                      height={40}
                    />
                  </div>
                  <span className={styles.productName}>{product.title}</span>
                </div>
                <span className={styles.productQty}>{product.quantity}</span>
                <span className={styles.productPrice}>
                  {formatPriceAzn(product.totalPrice)}
                </span>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
