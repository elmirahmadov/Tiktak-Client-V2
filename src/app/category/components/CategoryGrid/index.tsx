import type { ICategory } from "@/common/types/api.types";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import styles from "./CategoryGrid.module.css";

function resolveCatImage(img?: string | null): string | null {
  if (!img || !img.trim()) return "/globe.svg";
  const v = img.trim();
  const invalid = ["null", "undefined", "test", "none", ""];
  if (invalid.includes(v.toLowerCase())) return "/globe.svg";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) {
    return v.startsWith("/") ? v : `/${v}`;
  }
  return v.startsWith("/") ? `${base}${v}` : `${base}/${v}`;
}

interface Props {
  items: ICategory[];
}

const PAGE_SIZE = 18;

const CategoryGrid: React.FC<Props> = ({ items }) => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelect = useCallback(
    (id: number) => {
      router.push(`/categories?category=${id}`);
    },
    [router]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.tileGrid}>
        {visible.map((cat) => {
          const imgSrc = resolveCatImage(cat.img_url);
          return (
            <div
              key={cat.id}
              className={styles.tile}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(cat.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelect(cat.id);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc || "/globe.svg"}
                alt={cat.name}
                width={80}
                height={80}
                className={styles.tileImg}
                loading="lazy"
              />
              <span className={styles.tileName}>{cat.name}</span>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagerRow}>
          <button
            type="button"
            className={styles.pagerBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            &#8592;
          </button>
          <span className={styles.pagerInfo}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pagerBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(CategoryGrid);
