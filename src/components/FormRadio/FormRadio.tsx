import { forwardRef } from 'react';
import styles from './FormRadio.module.css';

export interface FormRadioProps {
  id?: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
  /** State=Error (group without answer on submit). */
  invalid?: boolean;
  disabled?: boolean;
}

/**
 * Figma: Form / Radio (24:1646). State: Default, Selected (`checked`),
 * Error (`invalid`), Disabled. The hit area includes the text.
 */
export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(function FormRadio(
  { id, name, value, label, checked, onChange, invalid = false, disabled = false },
  ref,
) {
  const cls = [styles.radio, invalid ? styles.invalid : '', disabled ? styles.disabled : ''].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input
        ref={ref}
        id={id}
        className={styles.input}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className={styles.control} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
});
