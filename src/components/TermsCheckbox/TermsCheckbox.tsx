import { forwardRef } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './TermsCheckbox.module.css';

export interface TermsCheckboxProps {
  id: string;
  /** State=Selected when checked; Default leaves "Solicitar cotação" disabled. */
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Button State=Loading while sending. */
  loading?: boolean;
  label?: string;
  submitLabel?: string;
}

/**
 * Figma: Quotation / Terms Checkbox / Desktop (5:2632) — acceptance +
 * "Solicitar cotação". The submit button is a real submit of the parent form.
 */
export const TermsCheckbox = forwardRef<HTMLButtonElement, TermsCheckboxProps>(function TermsCheckbox(
  {
    id,
    checked,
    onCheckedChange,
    loading = false,
    label = 'Ao solicitar a cotação você concorda com os dados informados acima',
    submitLabel = 'Solicitar cotação',
  },
  ref,
) {
  return (
    <div className={styles.row}>
      <label className={styles.checkbox} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={loading}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span className={styles.box} aria-hidden="true">
          {checked && <Icon name="check" size={16} tone="on-brand" />}
        </span>
        <span className={styles.label}>{label}</span>
      </label>
      <div className={styles.actions}>
        <Button
          ref={ref}
          type="submit"
          variant="primary"
          size="medium"
          iconLeft={loading ? undefined : 'check'}
          label={submitLabel}
          loading={loading}
          disabled={!checked && !loading}
        />
      </div>
    </div>
  );
});
