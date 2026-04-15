"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useCategoryActions, useCategoryList } from "@/common/store/category";
import {
  useProductActions,
  useProductError,
  useProductList,
  useProductLoading,
} from "@/common/store/product";
import {
  addToBasket,
  decreaseFromBasket,
  getBasket,
  removeAllFromBasket,
} from "@/services/api/basket.api";
import {
  FiArrowLeft,
  FiHeart,
  FiMapPin,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";
import { useFavouritesStore } from "@/common/store/favourites/favourites.store";
import styles from "../page.module.css";

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

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ productId?: string }>();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const categoryIdFromQuery = Number(searchParams.get("category") || "0");
  const productId = Number(params?.productId || "0");

  const categories = useCategoryList();
  const { fetchCategories } = useCategoryActions();

  const products = useProductList();
  const productsLoading = useProductLoading();
  const productsError = useProductError();
  const { fetchProducts } = useProductActions();

  const { addFavourite, removeFavourite, isFavourite } = useFavouritesStore();

  const [basketQuantities, setBasketQuantities] = useState<
    Record<number, number>
  >({});
  // localQty: yalnız "Səbətə əlavə et" basılmamış məhsul üçün görüntülük say
  const [localQty, setLocalQty] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const activeCategoryId =
    !Number.isNaN(categoryIdFromQuery) && categoryIdFromQuery > 0
      ? categoryIdFromQuery
      : null;

  const selectedProduct = useMemo(() => {
    if (!productId) return null;
    return products.find((product) => product.id === productId) || null;
  }, [products, productId]);

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

  const increaseQty = async (id: number) => {
    try {
      await addToBasket(id, {
        quantity: 1,
        productId: String(id),
      });
      await syncBasketFromApi();
    } catch (error) {
      console.error("Mehsul sebete elave edilmedi:", error);
    }
  };

  const decreaseQty = async (id: number) => {
    try {
      const currentQty = basketQuantities[id] || 0;
      if (currentQty <= 1) {
        await removeAllFromBasket(id);
      } else {
        await decreaseFromBasket(id, {
          quantity: 1,
          productId: String(id),
        });
      }
      await syncBasketFromApi();
    } catch (error) {
      console.error("Sebetde mehsul azaldilmadi:", error);
    }
  };

  // Məhsul artıq səbətdədir — +/- API-yə toxunur
  const increaseBasketQty = (id: number) => increaseQty(id);
  const decreaseBasketQty = (id: number) => decreaseQty(id);

  // Məhsul hələ səbətdə deyil — yalnız localQty dəyişir
  const increaseLocalQty = () => setLocalQty((q) => q + 1);
  const decreaseLocalQty = () => setLocalQty((q) => Math.max(1, q - 1));

  // "Səbətə əlavə et" basıldı
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

  const removeFromBasket = async (id: number) => {
    try {
      await removeAllFromBasket(id);
      await syncBasketFromApi();
    } catch (error) {
      console.error("Mehsul sebetden silinmedi:", error);
    }
  };

  return (
    <div className={styles.pageShell}>
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
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className={styles.searchField}
                placeholder="Axtarış"
                aria-label="Axtarış"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <nav
            className={styles.navActions}
            aria-label="Product detail navigation"
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
            <p className={styles.crumb}>Ana səhifə / Məhsul detalı</p>
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
                  onClick={() => router.push(`/categories?category=${cat.id}`)}
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
              <p className={styles.message}>Məhsul yüklənir...</p>
            ) : productsError ? (
              <p className={styles.messageError}>{productsError}</p>
            ) : !selectedProduct ? (
              <p className={styles.message}>Məhsul tapılmadı.</p>
            ) : (
              <article className={styles.detailCard}>
                <div className={styles.detailTopRow}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() =>
                      router.push(
                        `/categories${
                          activeCategoryId
                            ? `?category=${activeCategoryId}`
                            : ""
                        }`,
                      )
                    }
                  >
                    <FiArrowLeft
                      className={styles.backBtnIcon}
                      aria-hidden="true"
                    />
                    <span>Geri qayıt</span>
                  </button>

                  <button
                    type="button"
                    className={styles.favoriteBtn}
                    onClick={() => {
                      if (isFavourite(selectedProduct.id)) {
                        removeFavourite(selectedProduct.id);
                      } else {
                        addFavourite(selectedProduct);
                      }
                    }}
                    aria-label={
                      isFavourite(selectedProduct.id)
                        ? "Siyahıdan sil"
                        : "Siyahıya əlavə et"
                    }
                  >
                    <FiHeart
                      style={
                        isFavourite(selectedProduct.id)
                          ? { fill: "#e53e3e", stroke: "#e53e3e" }
                          : {}
                      }
                    />
                  </button>
                </div>

                <div className={styles.detailBody}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(selectedProduct.img_url)}
                    alt={selectedProduct.title}
                    className={styles.detailImage}
                    width={360}
                    height={360}
                  />

                  <div className={styles.detailInfo}>
                    <h3 className={styles.detailTitle}>
                      {selectedProduct.title}
                    </h3>
                    <p className={styles.detailText}>
                      {selectedProduct.description ||
                        "Məhsul haqqında qısa məlumat. API-dən təsvir gələndə burada görünəcək."}
                    </p>
                    <p className={styles.detailPrice}>
                      {formatPrice(selectedProduct.price)}
                    </p>

                    {(() => {
                      const inBasket =
                        (basketQuantities[selectedProduct.id] || 0) > 0;
                      const displayQty = inBasket
                        ? basketQuantities[selectedProduct.id]
                        : localQty;

                      return (
                        <>
                          <div className={styles.detailQtyRow}>
                            <button
                              type="button"
                              className={styles.detailQtyBtn}
                              onClick={() =>
                                inBasket
                                  ? decreaseBasketQty(selectedProduct.id)
                                  : decreaseLocalQty()
                              }
                              disabled={!inBasket && localQty <= 1}
                            >
                              -
                            </button>
                            <span className={styles.detailQtyValue}>
                              {displayQty} kq
                            </span>
                            <button
                              type="button"
                              className={styles.detailQtyBtn}
                              onClick={() =>
                                inBasket
                                  ? increaseBasketQty(selectedProduct.id)
                                  : increaseLocalQty()
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className={styles.addBtn}
                            onClick={() =>
                              !inBasket && handleAddToBasket(selectedProduct.id)
                            }
                            disabled={inBasket}
                            style={
                              inBasket
                                ? {
                                    background: "#b2e09a",
                                    cursor: "not-allowed",
                                  }
                                : undefined
                            }
                          >
                            {inBasket ? "Səbətdə" : "Səbətə əlavə et"}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </article>
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
                  Ödə / Sifarişlə
                </button>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
