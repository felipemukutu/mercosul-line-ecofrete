import type { MouseEvent } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './SideMenu.module.css';

export interface SideMenuItemProps {
  /** Style=Default (root item with icon) | Subitem. */
  itemStyle?: 'default' | 'subitem';
  label: string;
  icon?: IconName;
  /** State=Active (current section). Hover is CSS. */
  active?: boolean;
  showChevron?: boolean;
  /** Group is open (subitems visible) → chevron points up. */
  open?: boolean;
}

// Links have no destination in this scope (SPEC §5).
const inert = (e: MouseEvent) => e.preventDefault();

/** Figma: Side Menu Item (5:2190). */
export function SideMenuItem({ itemStyle = 'default', label, icon, active = false, showChevron = true, open = false }: SideMenuItemProps) {
  if (itemStyle === 'subitem') {
    return (
      <a href="#" className={styles.subitem} onClick={inert}>
        <span className={styles.subitemLabel}>{label}</span>
      </a>
    );
  }
  return (
    <a href="#" className={`${styles.item} ${active ? styles.itemActive : ''}`} aria-current={active ? 'page' : undefined} onClick={inert}>
      {icon && <Icon name={icon} size={32} tone="primary" />}
      <span className={styles.itemLabel}>{label}</span>
      {showChevron && <Icon name="chevron" size={16} tone="muted" rotate={open ? 180 : 0} className={styles.itemChevron} />}
    </a>
  );
}
