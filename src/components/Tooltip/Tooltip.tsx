import styles from './Tooltip.module.css';

export interface TooltipProps {
  id: string;
  text?: string;
  visible: boolean;
}

/** Figma: Tooltip (25:1642) — dark bubble above the element, arrow pointing down. */
export function Tooltip({ id, text = 'Em breve', visible }: TooltipProps) {
  return (
    <span id={id} role="tooltip" className={`${styles.tooltip} ${visible ? styles.visible : ''}`} aria-hidden={!visible}>
      <span className={styles.bubble}>{text}</span>
      <span className={styles.arrow} />
    </span>
  );
}
