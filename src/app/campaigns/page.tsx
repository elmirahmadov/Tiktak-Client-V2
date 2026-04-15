"use client";

import { useEffect, useState } from "react";
import { useCampaignActions, useCampaigns } from "@/common/store/campaign";
import styles from "./page.module.css";

function toStatusLabel(isActive?: boolean): string {
  return isActive ? "Active" : "Passive";
}

export default function CampaignsPage() {
  const { campaigns, loading } = useCampaigns();
  const { getAllCampaigns } = useCampaignActions();
  const [errorText, setErrorText] = useState<string>("");

  const fetchCampaigns = () => {
    setErrorText("");
    return getAllCampaigns((err) => {
      const message = err instanceof Error ? err.message : "Campaign data could not be loaded";
      setErrorText(message);
    });
  };

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Campaigns</h1>
            <p className={styles.subtitle}>All campaigns from API are listed here.</p>
          </div>

          <button
            type="button"
            className={styles.reloadBtn}
            onClick={fetchCampaigns}
            disabled={loading}
          >
            {loading ? "Loading..." : "Reload"}
          </button>
        </header>

        {loading && campaigns.length === 0 && (
          <div className={styles.state}>Campaigns are loading...</div>
        )}

        {errorText && <div className={`${styles.state} ${styles.error}`}>{errorText}</div>}

        {!loading && !errorText && campaigns.length === 0 && (
          <div className={styles.empty}>No campaign found.</div>
        )}

        {campaigns.length > 0 && (
          <div className={styles.grid}>
            {campaigns.map((campaign) => (
              <article className={styles.card} key={campaign.id}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{campaign.title}</h2>
                  <span className={styles.badge}>%{campaign.discountPercentage ?? 0}</span>
                </div>

                <p className={styles.desc}>{campaign.description || "No description"}</p>

                <div className={styles.meta}>
                  <span>id: {campaign.id}</span>
                  <span className={styles.status}>{toStatusLabel(campaign.isActive)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
