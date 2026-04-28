"use client";

import {
  useCategoryActions,
  useCategoryError,
  useCategoryList,
  useCategoryLoading,
} from "@/common/store/category";
import { AppHeader } from "@/common/components/AppHeader";
import { CategorySearchField } from "@/common/components/CategorySearchField";
import { useCategorySearch } from "@/common/hooks/useCategorySearch";
import { useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryGrid from "./components/CategoryGrid";
import PromoBanner from "./components/PromoBanner";
import styles from "./page.module.css";

const CategoryPage = () => {
  const router = useRouter();
  const categories = useCategoryList();
  const loading = useCategoryLoading();
  const error = useCategoryError();
  const { fetchCategories: storeFetchCategories } = useCategoryActions();
  const fetchCategories = useCallback(() => {
    try {
      return storeFetchCategories();
    } catch (err) {
      console.error("Error in fetchCategories:", err);
      throw err;
    }
  }, [storeFetchCategories]);

  // Safety check to ensure we have valid data
  useEffect(() => {
    if (!Array.isArray(categories)) {
      console.warn("Categories is not an array:", categories);
    }
  }, [categories]);
  const {
    filteredCategories,
    handleBlur,
    handleFocus,
    handleOverlayClick,
    handleSearchSubmit,
    handleSuggestionClick,
    isSearchFocused,
    normalizedQuery,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    showResults,
    suggestionList,
  } = useCategorySearch({
    categories,
    fetchCategories,
    onSuggestionSelect: (categoryId) => {
      router.push(`/categories?category=${categoryId}`);
    },
  });

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
          {error && error.toLowerCase().includes("giris") && (
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

      <AppHeader
        ariaLabel="Category page navigation"
        topNavClassName={isSearchFocused ? styles.topNavFocused : undefined}
        searchClassName={
          isSearchFocused ? styles.searchShellFocused : styles.searchShell
        }
        searchContent={
          <CategorySearchField
            classNames={{
              input: styles.searchField,
              noResult: styles.searchNoResult,
              resultItem: styles.searchResultItem,
              results: styles.searchResults,
            }}
            inputRef={searchInputRef}
            normalizedQuery={normalizedQuery}
            onBlur={handleBlur}
            onChange={setSearchQuery}
            onFocus={handleFocus}
            onSubmit={handleSearchSubmit}
            onSuggestionClick={handleSuggestionClick}
            query={searchQuery}
            showResults={showResults}
            suggestions={suggestionList}
          />
        }
      />

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
