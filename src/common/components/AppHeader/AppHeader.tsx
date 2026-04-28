"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FiHeart, FiMapPin, FiShoppingCart, FiUser } from "react-icons/fi";
import { getProfile } from "@/services/api/profile.api";
import styles from "./AppHeader.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type AppHeaderProps = {
  activeHref?: string;
  ariaLabel?: string;
  locationAddress?: string;
  locationTitle?: string;
  searchContent?: ReactNode;
  searchPlaceholder?: string;
  topNavClassName?: string;
  searchClassName?: string;
  headerClassName?: string;
  navActionsClassName?: string;
};

const defaultNavItems: NavItem[] = [
  {
    href: "/account",
    label: "Hesabım",
    icon: <FiUser className={styles.iconSvg} aria-hidden="true" />,
  },
  {
    href: "/favourites",
    label: "Siyahılarım",
    icon: <FiHeart className={styles.iconSvg} aria-hidden="true" />,
  },
  {
    href: "/basket",
    label: "Səbətim",
    icon: <FiShoppingCart className={styles.iconSvg} aria-hidden="true" />,
  },
];

const joinClasses = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export default function AppHeader({
  activeHref,
  ariaLabel = "Page navigation",
  locationAddress,
  locationTitle = "Unvan",
  searchContent,
  searchPlaceholder,
  topNavClassName,
  searchClassName,
  headerClassName,
  navActionsClassName,
}: AppHeaderProps) {
  const pathname = usePathname();
  const [resolvedAddress, setResolvedAddress] = useState(
    locationAddress || "Adres qeyd olunmayıb",
  );

  useEffect(() => {
    if (typeof locationAddress === "string") {
      setResolvedAddress(locationAddress || "Adres qeyd olunmayıb");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setResolvedAddress("Adres qeyd olunmayıb");
      return;
    }

    let isMounted = true;

    const loadProfileAddress = async () => {
      try {
        const profile = await getProfile();

        if (!isMounted) {
          return;
        }

        setResolvedAddress(profile?.address?.trim() || "Adres qeyd olunmayıb");
      } catch {
        if (isMounted) {
          setResolvedAddress("Adres qeyd olunmayıb");
        }
      }
    };

    loadProfileAddress();

    return () => {
      isMounted = false;
    };
  }, [locationAddress]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ address?: string | null }>;
      setResolvedAddress(
        customEvent.detail?.address?.trim() || "Adres qeyd olunmayıb",
      );
    };

    window.addEventListener("tiktak:profile-updated", onProfileUpdated);

    return () => {
      window.removeEventListener("tiktak:profile-updated", onProfileUpdated);
    };
  }, []);

  return (
    <header className={joinClasses(styles.header, headerClassName)}>
      <div className={joinClasses(styles.topNav, topNavClassName)}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.brand}>
            TIK TAK
          </Link>

          <div className={styles.locationBox}>
            <div className={styles.locationIcon}>
              <FiMapPin size={16} />
            </div>
            <div className={styles.locationMeta}>
              <div className={styles.locationTitle}>{locationTitle}</div>
              <div className={styles.locationAddress}>{resolvedAddress}</div>
            </div>
          </div>
        </div>

        {(searchContent || searchPlaceholder) && (
          <div className={joinClasses(styles.searchShell, searchClassName)}>
            {searchContent || (
              <input
                type="text"
                className={styles.defaultSearchInput}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            )}
          </div>
        )}

        <nav
          className={joinClasses(styles.navActions, navActionsClassName)}
          aria-label={ariaLabel}
        >
          {defaultNavItems.map((item) => {
            const isActive = (activeHref || pathname) === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={joinClasses(
                  styles.navBtn,
                  isActive && styles.navBtnActive,
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
