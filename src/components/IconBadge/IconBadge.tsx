import { Icon, type IconName } from '../Icon/Icon';
import styles from './IconBadge.module.css';

export interface IconBadgeProps {
  icon: IconName;
  /** Glyph size inside the 48 circle. */
  iconSize?: 32 | 48;
}

/** Figma layer role "Icon Badge": 48 circle (color/bg/info) with a brand icon. */
export function IconBadge({ icon, iconSize = 32 }: IconBadgeProps) {
  return (
    <span className={styles.badge} aria-hidden="true">
      <Icon name={icon} size={iconSize} tone="primary" />
    </span>
  );
}
