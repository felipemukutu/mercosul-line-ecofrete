import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'link';
export type ButtonSize = 'medium' | 'small' | 'tiny';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: ReactNode;
  /** State=Loading (Primary only): spinner + "Enviando…", not clickable. */
  loading?: boolean;
  loadingLabel?: string;
  iconLeft?: IconName;
  iconRight?: IconName;
  /**
   * Render as a non-interactive <span> with the button look — used when the
   * button sits inside another control (e.g. the Upload / Dropzone).
   */
  presentational?: boolean;
}

/**
 * Figma: Button (4:999). Hover and Pressed are CSS states; Disabled and
 * Loading are derived from `disabled` / `loading`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'medium',
    label,
    loading = false,
    loadingLabel = 'Enviando…',
    iconLeft,
    iconRight,
    presentational = false,
    disabled,
    className,
    type = 'button',
    onClick,
    ...rest
  },
  ref,
) {
  const iconSize = size === 'medium' ? 24 : 18;
  const cls = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = loading ? (
    <>
      <Icon name="spinner" size={iconSize} tone="on-brand" spin />
      <span className={styles.text}>{loadingLabel}</span>
    </>
  ) : (
    <>
      {iconLeft && <Icon name={iconLeft} size={iconSize} className={styles.icon} />}
      <span className={styles.text}>{label}</span>
      {iconRight && <Icon name={iconRight} size={iconSize} className={styles.icon} />}
    </>
  );

  if (presentational) {
    return (
      <span className={cls} aria-hidden="true">
        {content}
      </span>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cls}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {content}
    </button>
  );
});
