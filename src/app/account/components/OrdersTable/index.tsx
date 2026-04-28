import { useEffect, useState } from "react";
import { formatPriceAzn } from "@/common/utils/productPresentation";
import {
  formatOrderAddress,
  formatOrderDate,
  formatOrderIdentifier,
} from "@/common/utils/orderPresentation";
import { getUserOrders, type IOrderListItem } from "@/services/api/orders.api";
import styles from "../../page.module.css";

type OrdersTableProps = {
  onViewDetails: (orderId: string) => void;
};

export default function OrdersTable({ onViewDetails }: OrdersTableProps) {
  const [orders, setOrders] = useState<IOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorText("");

      try {
        const data = await getUserOrders();
        if (isMounted) {
          setOrders(data);
        }
      } catch (error) {
        const status =
          typeof error === "object" && error !== null && "status" in error
            ? Number((error as { status?: number }).status)
            : undefined;

        if (isMounted) {
          setErrorText(
            status === 401
              ? "Sifarişləri görmək üçün yenidən daxil olun."
              : "Sifarişlər yüklənmədi.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Sifariş Tarixçəsi</h2>
        </div>
      </div>

      <div className={styles.ordersTableWrapper}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Tarix</th>
              <th>Çatdırılma ünvanı</th>
              <th>Məhsul sayı</th>
              <th>Subtotal/Çatdırılma</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={styles.ordersState}>
                  Sifarişlər yüklənir...
                </td>
              </tr>
            ) : errorText ? (
              <tr>
                <td
                  colSpan={7}
                  className={`${styles.ordersState} ${styles.ordersStateError}`}
                >
                  {errorText}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.ordersState}>
                  Hələ sifariş yoxdur.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{formatOrderIdentifier(order.id, order.orderNumber)}</td>
                  <td>{formatOrderDate(order.createdAt)}</td>
                  <td>{formatOrderAddress(order.address)}</td>
                  <td>{order.itemCount}</td>
                  <td>{formatPriceAzn(order.totalPrice)}</td>
                  <td className={styles.orderStatus}>{order.status || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.orderDetail}
                      disabled={!order.id && !order.orderNumber}
                      onClick={() =>
                        onViewDetails(order.id || order.orderNumber)
                      }
                    >
                      detallar <span aria-hidden="true">›</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
