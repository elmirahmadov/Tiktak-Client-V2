import type { IUser } from "@/common/types/api.types";
import styles from "../../page.module.css";

type AddressInfoProps = {
  note: string;
  onNoteChange: (value: string) => void;
  profile: IUser | null;
};

export default function AddressInfo({
  note,
  onNoteChange,
  profile,
}: AddressInfoProps) {
  return (
    <div className={styles.infoGrid}>
      <div>
        <h3 className={styles.blockTitle}>Adınız</h3>
        <p className={styles.blockValue}>{profile?.full_name || "-"}</p>

        <h3 className={styles.blockTitle}>Ünvanınız</h3>
        <p className={styles.blockValue}>
          {profile?.address || "Ünvan qeyd olunmayıb"}
        </p>

        <h3 className={styles.blockTitle}>Telefon nömrəniz</h3>
        <p className={styles.blockValue}>{profile?.phone || "-"}</p>
      </div>

      <div>
        <label className={styles.blockTitle} htmlFor="checkout-note">
          Əlavə qeyd
        </label>
        <textarea
          id="checkout-note"
          className={styles.noteInput}
          placeholder="Qapıya qədər park kodu, bina girişi və qeyd"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
        />
      </div>
    </div>
  );
}
