"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiShoppingCart,
  FiMapPin,
} from "react-icons/fi";
import { getUserOrders, type IOrderListItem } from "@/services/api/orders.api";
import styles from "../page.module.css";

const topNavItems = [
  {
    label: "Hesabım",
    node: <FiUser className={styles.iconSvg} aria-hidden="true" />,
    href: "/account",
  },
  {
    label: "Siyahılarım",
    node: <FiHeart className={styles.iconSvg} aria-hidden="true" />,
    href: "/favourites",
  },
  {
    label: "Səbətim",
    node: <FiShoppingCart className={styles.iconSvg} aria-hidden="true" />,
    href: "/basket",
  },
];

const navItems = [
  { label: "Hesab məlumatlarım", icon: <FiUser />, href: "/account" },
  { label: "Sifarişlərim", icon: <FiPackage />, href: "/account/orders" },
];

const formatOrderDate = (value: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("az-AZ");
};

const formatAmount = (value: number): string => {
  return `${value.toFixed(2)} AZN`;
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
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
    <div className={styles.accountPage}>
      <header className={styles.navBand}>
        <div className={styles.topNav}>
          <div className={styles.navLeft}>
            <strong className={styles.brand}>TIK TAK</strong>
            <div className={styles.locationBox}>
              <div className={styles.locationIcon}>
                <FiMapPin size={16} />
              </div>
              <div className={styles.locationMeta}>
                <div className={styles.locationTitle}>Unvan</div>
                <div className={styles.locationAddress}>
                  Adres qeyd olunmayıb
                </div>
              </div>
            </div>
          </div>

          <div className={styles.searchShell}>
            <input
              type="text"
              className={styles.searchField}
              placeholder="Axtarış"
              aria-label="Axtarış"
            />
          </div>

          <nav
            className={styles.navActions}
            aria-label="Account page navigation"
          >
            {topNavItems.map((item) => (
              <Link key={item.label} href={item.href} className={styles.navBtn}>
                {item.node}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className={styles.pageBody}>
        <aside className={styles.sidebar}>
          <h1 className={styles.sidebarTitle}>Hesabım</h1>
          <nav className={styles.navList} aria-label="Hesab menyusu">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  onClick={() => router.push(item.href)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navItemLabel}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={styles.contentArea}>
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
                        <td>#{order.orderNumber || order.id}</td>
                        <td>{formatOrderDate(order.createdAt)}</td>
                        <td>{order.address || "Ünvan qeyd olunmayıb"}</td>
                        <td>{order.itemCount}</td>
                        <td>{formatAmount(order.totalPrice)}</td>
                        <td className={styles.orderStatus}>
                          {order.status || "-"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.orderDetail}
                            disabled={!order.id && !order.orderNumber}
                            onClick={() =>
                              router.push(
                                `/account/orders/${encodeURIComponent(order.id || order.orderNumber)}`,
                              )
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
        </main>
      </div>
    </div>
  );
}
