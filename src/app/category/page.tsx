"use client";

import {
  useCategoryActions,
  useCategoryError,
  useCategoryList,
  useCategoryLoading,
} from "@/common/store/category";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiMapPin, FiShoppingCart, FiUser } from "react-icons/fi";
import CategoryGrid from "./components/CategoryGrid";
import PromoBanner from "./components/PromoBanner";
import styles from "./CategoryPage.module.css";

const navIcons = [
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

const CategoryPage = () => {
  const router = useRouter();
  const categories = useCategoryList();
  const loading = useCategoryLoading();
  const error = useCategoryError();
  const { fetchCategories } = useCategoryActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const waitMs = searchQuery.trim() === "" ? 500 : 1200;

    searchTimeoutRef.current = setTimeout(() => {
      // Same approach as tiktak-web: delayed API fetch, not per key stroke.
      fetchCategories();
    }, waitMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchCategories]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return categories;
    return categories.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, normalizedQuery]);

  const suggestionList = useMemo(() => {
    if (!normalizedQuery) return [];
    return filteredCategories.slice(0, 6);
  }, [filteredCategories, normalizedQuery]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowResults(false);
    setIsSearchFocused(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSuggestionClick = (categoryId: number) => {
    setShowResults(false);
    setIsSearchFocused(false);
    router.push(`/categories?category=${categoryId}`);
  };

  const handleOverlayClick = () => {
    setShowResults(false);
    setIsSearchFocused(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.statusMsg}>Kateqoriyalar yüklənir...</div>;
    }
    if (error) {
      return (
        <div className={styles.statusWrap}>
          <div className={styles.statusMsg} style={{ color: "#d9534f" }}>
            {error}
          </div>
          {error.toLowerCase().includes("giris") && (
            <button
              type="button"
              className={styles.loginBtn}
              onClick={() => router.push("/login")}
            >
              Giris sehifesine kec
            </button>
          )}
        </div>
      );
    }
    if (categories.length === 0) {
      return (
        <div className={styles.statusMsg}>Həç bir kateqoriya tapilmadi.</div>
      );
    }

    if (normalizedQuery && filteredCategories.length === 0) {
      return (
        <div className={styles.statusMsg}>Axtarışa uyğun nəticə yoxdur.</div>
      );
    }

    return <CategoryGrid items={filteredCategories} />;
  };

  return (
    <div className={styles.pageShell}>
      {isSearchFocused && (
        <div className={styles.overlay} onClick={handleOverlayClick} />
      )}

      <header className={styles.navBand}>
        <div
          className={`${styles.topNav} ${isSearchFocused ? styles.topNavFocused : ""}`}
        >
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

          <div
            className={`${styles.searchShell} ${
              isSearchFocused ? styles.searchShellFocused : ""
            }`}
          >
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className={styles.searchField}
                placeholder="Axtarış"
                aria-label="Axtarış"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setShowResults(true);
                  setIsSearchFocused(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowResults(false);
                    setIsSearchFocused(false);
                  }, 120);
                }}
                ref={searchInputRef}
              />
            </form>

            {showResults && normalizedQuery && (
              <div className={styles.searchResults}>
                {suggestionList.length > 0 ? (
                  suggestionList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={styles.searchResultItem}
                      onClick={() => handleSuggestionClick(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))
                ) : (
                  <div className={styles.searchNoResult}>Nəticə yoxdur</div>
                )}
              </div>
            )}
          </div>

          <nav
            className={styles.navActions}
            aria-label="Category page navigation"
          >
            {navIcons.map((item) => (
              <button
                key={item.label}
                type="button"
                className={styles.navBtn}
                onClick={() => item.href && router.push(item.href)}
              >
                {item.node}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className={styles.shellFrame}>
        <main className={styles.pageRoot}>
          <div className={styles.innerLayout}>
            <div className={styles.sidePanel}>
              <PromoBanner />
            </div>
            <div className={styles.contentArea}>{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;
