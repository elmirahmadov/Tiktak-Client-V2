import styles from "../../page.module.css";

type AccountFormData = {
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
  phone: string;
  position: string;
};

type AccountFormProps = {
  formData: AccountFormData;
  isLoadingProfile: boolean;
  isSubmitting: boolean;
  onChange: (field: keyof AccountFormData, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  statusMessage: string;
  statusType: "success" | "error";
};

export function AccountForm({
  formData,
  isLoadingProfile,
  isSubmitting,
  onChange,
  onSubmit,
  statusMessage,
  statusType,
}: AccountFormProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Əlaqə məlumatlarınız</h2>
        </div>
      </div>

      <form className={styles.formGrid} onSubmit={onSubmit} autoComplete="off">
        {isLoadingProfile ? (
          <p className={styles.statusMessage}>Profil məlumatları yüklənir...</p>
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
            onChange={(event) => onChange("name", event.target.value)}
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
            onChange={(event) => onChange("phone", event.target.value)}
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
            onChange={(event) => onChange("email", event.target.value)}
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
            onChange={(event) => onChange("position", event.target.value)}
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
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="Yeni şifrə"
            autoComplete="new-password"
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
              onChange("confirmPassword", event.target.value)
            }
            placeholder="Şifrəni təkrarlayın"
            autoComplete="new-password"
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
  );
}
