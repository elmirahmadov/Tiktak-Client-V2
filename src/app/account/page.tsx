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
import type { IProfileUpdateRequest } from "@/common/types/api.types";
import { getProfile, updateProfile } from "@/services/api/profile.api";
import styles from "./page.module.css";

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

export default function AccountPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await getProfile();

        if (!isMounted || !profile) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          position: profile.address || "",
        }));
      } catch {
        if (!isMounted) {
          return;
        }
        setStatusType("error");
        setStatusMessage("Profil məlumatları yüklənmədi.");
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      setStatusType("error");
      setStatusMessage("Yeni şifrə təkrarı uyğun deyil.");
      return;
    }

    const payload: IProfileUpdateRequest = {
      full_name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.position.trim(),
      email: formData.email.trim() || undefined,
    };

    if (formData.password.trim()) {
      payload.password = formData.password;
      payload.password_repeat = formData.confirmPassword;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile = await updateProfile(payload);

      setFormData((prev) => ({
        ...prev,
        name: updatedProfile?.full_name || prev.name,
        email: updatedProfile?.email || prev.email,
        phone: updatedProfile?.phone || prev.phone,
        position: updatedProfile?.address || prev.position,
        password: "",
        confirmPassword: "",
      }));

      setStatusType("success");
      setStatusMessage("Məlumatlarınız uğurla yeniləndi.");
    } catch {
      setStatusType("error");
      setStatusMessage("Məlumatlar yenilənmədi. Yenidən cəhd edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  onClick={() => item.href && router.push(item.href)}
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
                {/* <p className={styles.sectionTag}>Ödəniş məlumatları</p> */}
                <h2 className={styles.cardTitle}>Əlaqə məlumatlarınız</h2>
              </div>
            </div>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              {isLoadingProfile ? (
                <p className={styles.statusMessage}>
                  Profil məlumatları yüklənir...
                </p>
              ) : null}

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="name">
                  Adınız
                </label>
                <input
                  id="name"
                  type="text"
                  className={styles.fieldInput}
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Adınız"
                  disabled={isLoadingProfile || isSubmitting}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="phone">
                  Telefon nömrəsi
                </label>
                <input
                  id="phone"
                  type="text"
                  className={styles.fieldInput}
                  value={formData.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                  placeholder="(+994) 50 123 45 67"
                  disabled={isLoadingProfile || isSubmitting}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.fieldInput}
                  value={formData.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="Email"
                  disabled={isLoadingProfile || isSubmitting}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="position">
                  Ünvan
                </label>
                <input
                  id="position"
                  type="text"
                  className={styles.fieldInput}
                  value={formData.position}
                  onChange={(event) =>
                    handleChange("position", event.target.value)
                  }
                  placeholder="Ünvan"
                  disabled={isLoadingProfile || isSubmitting}
                />
              </div>

              <div className={styles.sectionDivider}>
                <div>
                  <span>Şifrənizin yenilənməsi</span>
                  <p className={styles.sectionDescription}>
                    Ehtiyac yoxdursa boş buraxın
                  </p>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="password">
                  Yeni Şifrə
                </label>
                <input
                  id="password"
                  type="password"
                  className={styles.fieldInput}
                  value={formData.password}
                  onChange={(event) =>
                    handleChange("password", event.target.value)
                  }
                  placeholder="Yeni şifrə"
                  disabled={isLoadingProfile || isSubmitting}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="confirmPassword">
                  Yeni Şifrənin təkrarı
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={styles.fieldInput}
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    handleChange("confirmPassword", event.target.value)
                  }
                  placeholder="Şifrəni təkrarlayın"
                  disabled={isLoadingProfile || isSubmitting}
                />
              </div>

              {statusMessage ? (
                <p
                  className={`${styles.statusMessage} ${
                    statusType === "error" ? styles.statusError : ""
                  }`}
                >
                  {statusMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoadingProfile || isSubmitting}
              >
                {isSubmitting ? "Yenilənir..." : "Melumatlari yenile"}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
