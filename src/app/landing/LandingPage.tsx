"use client";

import {
  footerColumns,
  footerMeta,
  footerNewsletterTitle,
  heroCards,
  metrics,
  promoCards,
  socialLinks,
} from "./landing.data";
import { useCampaignStore } from "@/common/store/campaign";
import { useRouter } from "next/navigation";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTelegramPlane,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import {
  FiGlobe,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMap,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { SiTiktok } from "react-icons/si";
import { useEffect, useMemo, useState } from "react";
import styles from "./LandingPage.module.css";

type HeroViewCard = {
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  tone: "green" | "red";
  imageUrl: string | null;
};

type PromoViewCard = {
  title: string;
  subtitle: string;
  tone: "dark" | "festive";
  imageUrl: string | null;
};

const PINNED_CAMPAIGN_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE8DYsa8w5sDbVjpiVy7teUl1zYClzSqcHUQ&s";

function shouldUsePinnedCampaignImage(title?: string | null): boolean {
  if (!title) return false;

  const normalizedTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return (
    normalizedTitle.includes("yay kampaniyasi") ||
    normalizedTitle.includes("ekskluziv kampaniyalar")
  );
}

const headerIcons = [
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

function getSocialIcon(label: string) {
  switch (label) {
    case "Facebook":
      return <FaFacebookF className={styles.socialIcon} aria-hidden="true" />;
    case "Instagram":
      return <FaInstagram className={styles.socialIcon} aria-hidden="true" />;
    case "YouTube":
      return <FaYoutube className={styles.socialIcon} aria-hidden="true" />;
    case "LinkedIn":
      return <FaLinkedinIn className={styles.socialIcon} aria-hidden="true" />;
    case "Telegram":
      return (
        <FaTelegramPlane className={styles.socialIcon} aria-hidden="true" />
      );
    case "TikTok":
      return <SiTiktok className={styles.socialIcon} aria-hidden="true" />;
    case "WhatsApp":
      return <FaWhatsapp className={styles.socialIcon} aria-hidden="true" />;
    default:
      return null;
  }
}

function getMetricIcon(label: string) {
  switch (label) {
    case "Market sayı":
      return <FiShoppingBag className={styles.metricIcon} aria-hidden="true" />;
    case "Region":
      return <FiMap className={styles.metricIcon} aria-hidden="true" />;
    case "Məhsul sayı":
      return <FiPackage className={styles.metricIcon} aria-hidden="true" />;
    case "Əməkdaş sayı":
      return <FiUsers className={styles.metricIcon} aria-hidden="true" />;
    default:
      return null;
  }
}

function resolveCampaignImageUrl(image?: string | null): string | null {
  if (!image || typeof image !== "string") return null;

  const trimmed = image.trim();
  if (!trimmed) return null;

  const invalidValues = ["null", "undefined", "test", "none", "-"];
  if (invalidValues.includes(trimmed.toLowerCase())) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export function LandingPage() {
  const [heroStartIndex, setHeroStartIndex] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);
  const router = useRouter();

  const {
    campaigns,
    loading,
    actions: { getAllCampaigns },
  } = useCampaignStore();

  useEffect(() => {
    getAllCampaigns().finally(() => setHasFetched(true));
  }, [getAllCampaigns]);

  const apiHeroCards: HeroViewCard[] = campaigns.map((campaign, index) => ({
    title: campaign.title,
    subtitle: campaign.description || "Yeni kampaniya",
    badge: `${campaign.discountPercentage ? `%${campaign.discountPercentage}` : "*"}`,
    cta: "Ətraflı",
    tone: index % 2 === 0 ? "green" : "red",
    imageUrl: shouldUsePinnedCampaignImage(campaign.title)
      ? PINNED_CAMPAIGN_IMAGE
      : resolveCampaignImageUrl(campaign.img_url),
  }));

  const apiPromoCards: PromoViewCard[] = campaigns
    .slice(2, 4)
    .map((campaign, index) => ({
      title: campaign.title,
      subtitle: campaign.description || "Aktual teklif",
      tone: index % 2 === 0 ? "dark" : "festive",
      imageUrl: shouldUsePinnedCampaignImage(campaign.title)
        ? PINNED_CAMPAIGN_IMAGE
        : resolveCampaignImageUrl(campaign.img_url),
    }));

  const finalHeroCards: HeroViewCard[] =
    apiHeroCards.length > 0
      ? apiHeroCards
      : heroCards.map((card) => ({ ...card, imageUrl: null }));

  const finalPromoCards: PromoViewCard[] =
    apiPromoCards.length > 0
      ? apiPromoCards
      : promoCards.map((card) => ({ ...card, imageUrl: null }));

  const maxHeroStartIndex = Math.max(0, finalHeroCards.length - 2);

  const visibleHeroCards = useMemo(() => {
    if (finalHeroCards.length <= 2) return finalHeroCards;
    return finalHeroCards.slice(heroStartIndex, heroStartIndex + 2);
  }, [finalHeroCards, heroStartIndex]);

  useEffect(() => {
    if (heroStartIndex > maxHeroStartIndex) {
      setHeroStartIndex(0);
    }
  }, [maxHeroStartIndex, heroStartIndex]);

  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);

  const canSlideHeroes = finalHeroCards.length > 1;
  const showLeftHeroNav = canSlideHeroes && heroStartIndex > 0;
  const showRightHeroNav = canSlideHeroes && heroStartIndex < maxHeroStartIndex;
  const isCardsLoading = loading || !hasFetched;
  const loadingCardPlaceholders = [0, 1];

  const handleHeroNav = (direction: "left" | "right") => {
    if (!canSlideHeroes) return;
    setSlideDir(direction);
    setHeroStartIndex((prev) => {
      if (direction === "left") {
        return Math.max(0, prev - 1);
      }
      return Math.min(maxHeroStartIndex, prev + 1);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <strong className={styles.logo}>TIK TAK</strong>
          <nav className={styles.nav} aria-label="Sitenin ust menyusu">
            {headerIcons.map((item) => (
              <button
                key={item.label}
                type="button"
                className={styles.iconButton}
                onClick={() => item.href && router.push(item.href)}
              >
                {item.node}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        <main className={styles.main}>
          {loading && (
            <p className={styles.loadingState}>Kampaniyalar yuklenir...</p>
          )}

          <section
            className={styles.heroCarousel}
            aria-label="One cixan kampaniyalar"
          >
            {!isCardsLoading && showLeftHeroNav && (
              <button
                type="button"
                className={`${styles.heroNavButton} ${styles.heroNavPrev}`}
                onClick={() => handleHeroNav("left")}
                aria-label="Onceki kampaniyalar"
              >
                <FiChevronLeft />
              </button>
            )}

            <div
              className={`${styles.heroGrid} ${
                slideDir === "right"
                  ? styles.slideFromRight
                  : slideDir === "left"
                    ? styles.slideFromLeft
                    : ""
              }`}
              onAnimationEnd={() => setSlideDir(null)}
            >
              {isCardsLoading
                ? loadingCardPlaceholders.map((placeholder) => (
                    <article
                      key={`hero-loading-${placeholder}`}
                      className={`${styles.heroCard} ${styles.loadingCard}`}
                    >
                      <div className={styles.loadingContent}>
                        <span
                          className={`${styles.loadingLine} ${styles.loadingLineLg}`}
                        />
                        <span
                          className={`${styles.loadingLine} ${styles.loadingLineMd}`}
                        />
                        <span
                          className={`${styles.loadingLine} ${styles.loadingLineSm}`}
                        />
                        <span className={styles.loadingCta} />
                      </div>
                    </article>
                  ))
                : visibleHeroCards.map((card, index) => (
                    <article
                      key={`${card.title}-${heroStartIndex}-${index}`}
                      className={`${styles.heroCard} ${
                        card.tone === "green"
                          ? styles.heroGreen
                          : styles.heroRed
                      }`}
                      style={
                        card.imageUrl
                          ? {
                              backgroundImage: `linear-gradient(140deg, rgba(9, 23, 17, 0.58), rgba(14, 40, 30, 0.42)), url(${card.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      <span className={styles.cardBadge}>{card.badge}</span>
                      <div className={styles.cardContent}>
                        <h2>{card.title}</h2>
                        <p>{card.subtitle}</p>
                        <button
                          type="button"
                          className={styles.heroCta}
                          onClick={() => router.push("/category")}
                        >
                          {card.cta}
                        </button>
                      </div>
                    </article>
                  ))}
            </div>

            {!isCardsLoading && showRightHeroNav && (
              <button
                type="button"
                className={`${styles.heroNavButton} ${styles.heroNavNext}`}
                onClick={() => handleHeroNav("right")}
                aria-label="Sonraki kampaniyalar"
              >
                <FiChevronRight />
              </button>
            )}
          </section>

          <section
            className={`${styles.sectionBlock} ${styles.specialOffersSection}`}
          >
            <div className={styles.sectionTitle}>
              <h3>Xususi təkliflər!</h3>
              <p>TİKTAK-da hər gün üçün super təklifləri qaçırmayın!</p>
            </div>

            <div className={styles.promoGrid}>
              {isCardsLoading
                ? loadingCardPlaceholders.map((placeholder) => (
                    <article
                      key={`promo-loading-${placeholder}`}
                      className={`${styles.promoCard} ${styles.loadingCard}`}
                    >
                      <div className={styles.loadingContent}>
                        <span
                          className={`${styles.loadingLine} ${styles.loadingLineLg}`}
                        />
                        <span
                          className={`${styles.loadingLine} ${styles.loadingLineMd}`}
                        />
                        <span
                          className={`${styles.loadingLine} ${styles.loadingLineSm}`}
                        />
                      </div>
                    </article>
                  ))
                : finalPromoCards.map((card) => (
                    <article
                      key={card.title}
                      className={`${styles.promoCard} ${
                        card.tone === "dark"
                          ? styles.promoDark
                          : styles.promoFestive
                      }`}
                      style={
                        card.imageUrl
                          ? {
                              backgroundImage: `linear-gradient(145deg, rgba(14, 23, 33, 0.58), rgba(22, 30, 43, 0.42)), url(${card.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      <div className={styles.cardContent}>
                        <h4>{card.title}</h4>
                        <p>{card.subtitle}</p>
                      </div>
                    </article>
                  ))}
            </div>
          </section>

          <section
            className={`${styles.sectionBlock} ${styles.metricsSection}`}
          >
            <div className={styles.sectionTitle}>
              <h3>Bizim göstəricilər</h3>
              <p>
                Biz yeni imkanlar axtarırıq və digərlərinin bilmədikləri yerlərə
                getməyə hazırıq.
              </p>
            </div>

            <div className={styles.metricsGrid}>
              {metrics.map((metric) => (
                <article key={metric.label} className={styles.metricCard}>
                  <strong>{metric.value}</strong>
                  <div className={styles.metricMeta}>
                    <span>{metric.label}</span>
                    {getMetricIcon(metric.label)}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <h5 className={styles.footerLogo}>TIK TAK</h5>

          <div className={styles.footerColumns}>
            {footerColumns.map((column) => (
              <section key={column.title}>
                <h6>{column.title}</h6>
                {column.links.map((link) => (
                  <a key={link} href="#" className={styles.footerLink}>
                    {link}
                  </a>
                ))}
              </section>
            ))}

            <section className={styles.newsletter}>
              <h6>{footerNewsletterTitle}</h6>
              <form>
                <input
                  type="email"
                  placeholder="E-mail daxil edin"
                  aria-label="Email unvani"
                />
                <button type="submit">Gonder</button>
              </form>
            </section>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerMetaRow}>
              <p className={styles.copyText}>{footerMeta.copyright}</p>
              <p className={styles.siteBy}>
                {footerMeta.siteByLabel}
                <span className={styles.siteByBadge}>
                  {footerMeta.siteByName}
                </span>
              </p>
              <p className={styles.localeText}>
                <FiGlobe className={styles.localeIcon} aria-hidden="true" />
                {footerMeta.locale}
              </p>
            </div>
            <div className={styles.socials}>
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  aria-label={`Sosial link ${item.label}`}
                >
                  {getSocialIcon(item.label)}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
