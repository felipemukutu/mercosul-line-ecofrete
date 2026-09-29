import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './RadioCard.module.css';

export type RadioCardState = 'default' | 'hover' | 'active' | 'off';

export interface RadioCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  description?: string;
  showDescription?: boolean;
  /** Optional trailing action (Figma "Show Button"). */
  button?: ReactNode;
  /** Active = selected. Off = unavailable (not selectable). Hover is CSS. */
  checked?: boolean;
  off?: boolean;
  /** Extra content positioned relative to the card (e.g. Tooltip). */
  overlay?: ReactNode;
}

/**
 * Figma: Radio Card / Desktop (5:2682). Rendered as role="radio";
 * keyboard handling lives in the parent radiogroup.
 */
export const RadioCard = forwardRef<HTMLDivElement, RadioCardProps>(function RadioCard(
  { title, description, showDescription = false, button, checked = false, off = false, overlay, className, ...rest },
  ref,
) {
  const state: RadioCardState = off ? 'off' : checked ? 'active' : 'default';
  return (
    <div className={styles.wrapper}>
    <div
      ref={ref}
      role="radio"
      aria-checked={checked}
      aria-disabled={off || undefined}
      data-state={state}
      className={[styles.card, styles[state], className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className={styles.info}>
        <span className={styles.radio} aria-hidden="true">
          <span className={styles.dot} />
        </span>
        <span className={styles.texts}>
          <span className={styles.title}>{title}</span>
          {showDescription && description && <span className={styles.description}>{description}</span>}
        </span>
      </span>
      {button}
    </div>
    {/* outside role="radio" so it does not leak into the accessible name */}
    {overlay}
    </div>
  );
});
