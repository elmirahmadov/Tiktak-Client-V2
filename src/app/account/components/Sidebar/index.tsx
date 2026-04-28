import { FiPackage, FiUser } from "react-icons/fi";
import styles from "../../page.module.css";

type AccountSection = "account" | "orders";

type SidebarProps = {
  onSelect: (section: AccountSection) => void;
  selected: AccountSection;
};

const navItems: Array<{
  icon: React.ReactNode;
  label: string;
  section: AccountSection;
}> = [
  { label: "Hesab məlumatlarım", icon: <FiUser />, section: "account" },
  { label: "Sifarişlərim", icon: <FiPackage />, section: "orders" },
];

export default function Sidebar({ onSelect, selected }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.sidebarTitle}>Hesabım</h1>
      <nav className={styles.navList} aria-label="Hesab menyusu">
        {navItems.map((item) => {
          const isActive = item.section === selected;

          return (
            <button
              key={item.label}
              type="button"
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => onSelect(item.section)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navItemLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
