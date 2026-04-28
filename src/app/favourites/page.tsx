"use client";

import { AppHeader } from "@/common/components/AppHeader";
import Products from "./components/Products";
import { useFavouritesStore } from "@/common/store/favourites/favourites.store";
import styles from "./page.module.css";

export default function FavouritesPage() {
  const { items, removeFavourite } = useFavouritesStore();

  return (
    <div className={styles.pageShell}>
      <AppHeader activeHref="/favourites" ariaLabel="Favourites navigation" />

      <main className={styles.screen}>
        <div className={styles.favContainer}>
          <div className={styles.favHeader}>
            <h2 className={styles.favTitle}>Siyahılarım</h2>
          </div>

          <Products items={items} onRemoveFavourite={removeFavourite} />
        </div>
      </main>
    </div>
  );
}
