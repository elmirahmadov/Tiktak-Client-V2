"use client";

import { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCategoryActions, useCategoryList } from "@/common/store/category";
import {
  useProductActions,
  useProductError,
  useProductList,
  useProductLoading,
} from "@/common/store/product";
import type { IProduct } from "@/common/types/api.types";
import { AppHeader } from "@/common/components/AppHeader";
import { CategorySearchField } from "@/common/components/CategorySearchField";
import { useBasketQuantities } from "@/common/hooks/useBasketQuantities";
import { useCategorySearch } from "@/common/hooks/useCategorySearch";
import { useFavouritesStore } from "@/common/store/favourites/favourites.store";
import { addToBasket } from "@/services/api/basket.api";
import BasketSidebar from "./components/BasketSidebar";
import CategorySidebar from "./components/CategorySidebar";
import ProductDetailPanel from "./components/ProductDetailPanel";
import Products from "./components/Products";
import styles from "./page.module.css";

function CategoriesDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdFromQuery = Number(searchParams.get("category") || "0");
  const productIdFromQuery = Number(searchParams.get("productId") || "0");

  const categories = useCategoryList();
  const { fetchCategories: storeFetchCategories } = useCategoryActions();
  const fetchCategories = useCallback(
    () => storeFetchCategories(),
    [storeFetchCategories],
  );

  const products = useProductList();
  const productsLoading = useProductLoading();
  const productsError = useProductError();
  const { fetchProducts: storeFetchProducts } = useProductActions();
  const fetchProducts = useCallback(
    () => storeFetchProducts(),
    [storeFetchProducts],
  );
  const favouriteItems = useFavouritesStore((state) => state.items);
  const addFavourite = useFavouritesStore((state) => state.addFavourite);
  const removeFavourite = useFavouritesStore((state) => state.removeFavourite);
  const [localQty, setLocalQty] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const {
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

  const activeCategoryId =
    !Number.isNaN(categoryIdFromQuery) && categoryIdFromQuery > 0
      ? categoryIdFromQuery
      : null;

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((p) => p.category?.id === activeCategoryId);
  }, [products, activeCategoryId]);

  const selectedProduct: IProduct | null = useMemo(() => {
    if (!productIdFromQuery) return null;
    return (
      products.find((product) => product.id === productIdFromQuery) || null
    );
  }, [productIdFromQuery, products]);

  const selectedIsFavourite = useMemo(() => {
    if (!selectedProduct) {
      return false;
    }

    return favouriteItems.some(
      (item) => String(item.id) === String(selectedProduct.id),
    );
  }, [favouriteItems, selectedProduct]);

  const {
    basketItems,
    basketQuantities,
    basketTotal,
    decreaseQty,
    increaseQty,
    removeFromBasket,
    syncBasketFromApi,
  } = useBasketQuantities(products);

  const handleAddToBasket = async (id: number) => {
    try {
      await addToBasket(id, {
        quantity: localQty,
        productId: String(id),
      });
      await syncBasketFromApi();
    } catch (error) {
      console.error("Mehsul sebete elave edilmedi:", error);
    }
  };

  return (
    <div className={styles.pageShell}>
      {isSearchFocused && (
        <div className={styles.overlay} onClick={handleOverlayClick} />
      )}

      <AppHeader
        ariaLabel="Categories detail navigation"
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

      <main className={styles.screen}>
        <section className={styles.container}>
          <CategorySidebar
            activeCategoryId={activeCategoryId}
            categories={categories}
            onSelectCategory={(categoryId) =>
              router.push(`/categories?category=${categoryId}`)
            }
          />

          {selectedProduct ? (
            <section className={styles.centerColumn}>
              <ProductDetailPanel
                displayQty={
                  (basketQuantities[selectedProduct.id] || 0) > 0
                    ? basketQuantities[selectedProduct.id]
                    : localQty
                }
                inBasket={(basketQuantities[selectedProduct.id] || 0) > 0}
                isFavourite={selectedIsFavourite}
                product={selectedProduct}
                onAddToBasket={() => handleAddToBasket(selectedProduct.id)}
                onBack={() =>
                  router.push(
                    `/categories${activeCategoryId ? `?category=${activeCategoryId}` : ""}`,
                  )
                }
                onDecreaseQty={() => {
                  if ((basketQuantities[selectedProduct.id] || 0) > 0) {
                    decreaseQty(selectedProduct.id);
                    return;
                  }

                  setLocalQty((quantity) => Math.max(1, quantity - 1));
                }}
                onIncreaseQty={() => {
                  if ((basketQuantities[selectedProduct.id] || 0) > 0) {
                    increaseQty(selectedProduct.id);
                    return;
                  }

                  setLocalQty((quantity) => quantity + 1);
                }}
                onToggleFavourite={() => {
                  if (selectedIsFavourite) {
                    removeFavourite(selectedProduct.id);
                    return;
                  }

                  addFavourite(selectedProduct);
                }}
              />
            </section>
          ) : (
            <Products
              activeProductId={null}
              basketQuantities={basketQuantities}
              onDecreaseQty={decreaseQty}
              onIncreaseQty={increaseQty}
              onOpenProduct={(productId) => {
                setLocalQty(1);
                router.push(
                  `/categories?${new URLSearchParams({
                    ...(activeCategoryId
                      ? { category: String(activeCategoryId) }
                      : {}),
                    productId: String(productId),
                  }).toString()}`,
                );
              }}
              products={filteredProducts}
              productsError={productsError}
              productsLoading={productsLoading}
            />
          )}

          <BasketSidebar
            items={basketItems}
            total={basketTotal}
            onCheckout={() => router.push("/checkout")}
            onDecrease={decreaseQty}
            onIncrease={increaseQty}
            onRemove={removeFromBasket}
          />
        </section>
      </main>
    </div>
  );
}

export default function CategoriesDetailsPage() {
  return (
    <Suspense fallback={<div className={styles.pageShell} />}>
      <CategoriesDetailsContent />
    </Suspense>
  );
}
