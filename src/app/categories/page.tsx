"use client";

import {
  Suspense,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCategoryActions, useCategoryList } from "@/common/store/category";
import {
  useProductActions,
  useProductError,
  useProductList,
  useProductLoading,
} from "@/common/store/product";
import type { IProduct } from "@/common/types/api.types";
import {
  addToBasket,
  decreaseFromBasket,
  getBasket,
  removeAllFromBasket,
} from "@/services/api/basket.api";
import { FiHeart, FiMapPin, FiShoppingCart, FiUser } from "react-icons/fi";
import styles from "./page.module.css";

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

function resolveImage(img?: string | null): string {
  if (!img || !img.trim()) return "/globe.svg";
  const v = img.trim();
  const invalid = ["null", "undefined", "test", "none", ""];
  if (invalid.includes(v.toLowerCase())) return "/globe.svg";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return v.startsWith("/") ? v : `/${v}`;
  return v.startsWith("/") ? `${base}${v}` : `${base}/${v}`;
}

function formatPrice(value: string | number): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return `${value} AZN`;
  return `${numeric.toFixed(2)} AZN`;
}

function CategoriesDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdFromQuery = Number(searchParams.get("category") || "0");

  const categories = useCategoryList();
  const { fetchCategories } = useCategoryActions();

  const products = useProductList();
  const productsLoading = useProductLoading();
  const productsError = useProductError();
  const { fetchProducts } = useProductActions();

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [basketQuantities, setBasketQuantities] = useState<
    Record<number, number>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const waitMs = searchQuery.trim() === "" ? 500 : 1200;

    searchTimeoutRef.current = setTimeout(() => {
      fetchCategories();
    }, waitMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchCategories]);

  const activeCategoryId =
    !Number.isNaN(categoryIdFromQuery) && categoryIdFromQuery > 0
      ? categoryIdFromQuery
      : null;

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((p) => p.category?.id === activeCategoryId);
  }, [products, activeCategoryId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const suggestionList = useMemo(() => {
    if (!normalizedQuery) return [];
    return categories
      .filter((cat) => cat.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [categories, normalizedQuery]);

  const activeProduct: IProduct | null = useMemo(() => {
    if (filteredProducts.length === 0) return null;
    if (!selectedProductId) return filteredProducts[0];
    const matched = filteredProducts.find((p) => p.id === selectedProductId);
    return matched || filteredProducts[0];
  }, [filteredProducts, selectedProductId]);

  const basketItems = useMemo(() => {
    return products
      .filter((product) => (basketQuantities[product.id] || 0) > 0)
      .map((product) => ({
        product,
        qty: basketQuantities[product.id],
      }));
  }, [products, basketQuantities]);

  const basketTotal = useMemo(() => {
    return basketItems.reduce((sum, item) => {
      const price = Number(item.product.price) || 0;
      return sum + price * item.qty;
    }, 0);
  }, [basketItems]);

  const syncBasketFromApi = useCallback(async () => {
    try {
      const basket = await getBasket();
      const qtyMap = (basket.items || []).reduce<Record<number, number>>(
        (acc, item) => {
          if (item.product?.id) {
            acc[item.product.id] = item.quantity || 0;
          }
          return acc;
        },
        {},
      );
      setBasketQuantities(qtyMap);
    } catch (error) {
      console.error("Sebet melumatlari alina bilmedi:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncBasketFromApi();
    }, 0);

    return () => clearTimeout(timer);
  }, [syncBasketFromApi]);

  const increaseQty = async (productId: number) => {
    try {
      await addToBasket(productId, {
        quantity: 1,
        productId: String(productId),
      });
      await syncBasketFromApi();
    } catch (error) {
      console.error("Mehsul sebete elave edilmedi:", error);
    }
  };

  const decreaseQty = async (productId: number) => {
    try {
      const currentQty = basketQuantities[productId] || 0;
      if (currentQty <= 1) {
        await removeAllFromBasket(productId);
      } else {
        await decreaseFromBasket(productId, {
          quantity: 1,
          productId: String(productId),
        });
      }
      await syncBasketFromApi();
    } catch (error) {
      console.error("Sebetde mehsul azaldilmadi:", error);
    }
  };

  const removeFromBasket = async (productId: number) => {
    try {
      await removeAllFromBasket(productId);
      await syncBasketFromApi();
    } catch (error) {
      console.error("Mehsul sebetden silinmedi:", error);
    }
  };

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
    setSelectedProductId(null);
    router.push(`/categories?category=${categoryId}`);
  };

  const handleOverlayClick = () => {
    setShowResults(false);
    setIsSearchFocused(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  return (
    <div className={styles.pageShell}>
      {isSearchFocused && (
        <div className={styles.overlay} onClick={handleOverlayClick} />
      )}

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
            aria-label="Categories detail navigation"
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

      <main className={styles.screen}>
        <section className={styles.container}>
          <aside className={styles.leftColumn}>
            <p className={styles.crumb}>Ana səhifə / Kateqoriya məhsulları</p>
            <h2 className={styles.title}>Kateqoriyalar</h2>

            <div className={styles.categoryPanel}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.categoryButton} ${
                    activeCategoryId === cat.id
                      ? styles.categoryButtonActive
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedProductId(null);
                    router.push(`/categories?category=${cat.id}`);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className={styles.promoTile}>
              <strong className={styles.promoHeadline}>
                MEYVƏLƏRƏ
                <br />
                ENDİRİM
              </strong>
            </div>
          </aside>

          <section className={styles.centerColumn}>
            {productsLoading ? (
              <p className={styles.message}>Məhsullar yüklənir...</p>
            ) : productsError ? (
              <p className={styles.messageError}>{productsError}</p>
            ) : filteredProducts.length === 0 ? (
              <p className={styles.message}>
                Bu kateqoriyada məhsul tapılmadı.
              </p>
            ) : (
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`${styles.productCard} ${
                      activeProduct?.id === product.id
                        ? styles.productCardActive
                        : ""
                    }`}
                    onClick={() =>
                      router.push(
                        `/categories/${product.id}${
                          activeCategoryId
                            ? `?category=${activeCategoryId}`
                            : ""
                        }`,
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push(
                          `/categories/${product.id}${
                            activeCategoryId
                              ? `?category=${activeCategoryId}`
                              : ""
                          }`,
                        );
                      }
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImage(product.img_url)}
                      alt={product.title}
                      className={styles.productImage}
                      width={96}
                      height={96}
                      loading="lazy"
                    />
                    <h3 className={styles.productName}>{product.title}</h3>
                    <p className={styles.productPrice}>
                      {formatPrice(product.price)}
                    </p>

                    {(basketQuantities[product.id] || 0) > 0 ? (
                      <div className={styles.qtyRow}>
                        <button
                          type="button"
                          className={`${styles.qtyBtn} ${styles.qtyBtnMinus}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseQty(product.id);
                          }}
                        >
                          -
                        </button>
                        <div className={styles.qtyCombo}>
                          <span className={styles.qtyBadge}>
                            {basketQuantities[product.id]} kq
                          </span>
                          <button
                            type="button"
                            className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              increaseQty(product.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.addBtnCard}
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseQty(product.id);
                        }}
                      >
                        Səbətə əlavə et
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.rightColumn}>
            <h3 className={styles.detailHeading}>Səbətim</h3>
            {basketItems.length === 0 ? (
              <div className={styles.basketCard}>
                <div className={styles.emptyBasketVisual}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/empty-basket.svg"
                    alt="Boş səbət"
                    className={styles.emptyBasketIllustration}
                  />
                </div>
                <p className={styles.emptyBasketTitle}>Səbətiniz boşdur</p>
                <p className={styles.emptyBasketText}>
                  Sifariş vermək üçün səbətinizə məhsul əlavə edin
                </p>
              </div>
            ) : (
              <div className={styles.basketCard}>
                <div className={styles.basketItemsList}>
                  {basketItems.map((item) => (
                    <div key={item.product.id} className={styles.basketItemRow}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveImage(item.product.img_url)}
                        alt={item.product.title}
                        className={styles.basketItemImg}
                        width={42}
                        height={42}
                      />
                      <div className={styles.basketItemMain}>
                        <strong className={styles.basketItemName}>
                          {item.product.title} {item.qty} kq
                        </strong>
                        <div className={styles.basketQtyRow}>
                          <button
                            type="button"
                            className={`${styles.qtyBtn} ${styles.qtyBtnMinus}`}
                            onClick={() => decreaseQty(item.product.id)}
                          >
                            -
                          </button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`}
                            onClick={() => increaseQty(item.product.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className={styles.basketItemSide}>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFromBasket(item.product.id)}
                          aria-label="Səbətdən sil"
                        >
                          🗑
                        </button>
                        <span>
                          {formatPrice(
                            (Number(item.product.price) || 0) * item.qty,
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.basketTotals}>
                  <div className={styles.totalRow}>
                    <span>Ümumi:</span>
                    <span>{formatPrice(basketTotal)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Çatdırılma:</span>
                    <span>Pulsuz</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalMain}`}>
                    <span>Yekun məbləğ:</span>
                    <strong>{formatPrice(basketTotal)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.checkoutBtn}
                  onClick={() => router.push("/checkout")}
                >
                  Sifarişi tamamla
                </button>
              </div>
            )}
          </aside>
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
