import type { FocusEvent } from 'react';
import { FormRadio } from '../FormRadio/FormRadio';
import styles from './FormRadioGroup.module.css';

export interface RadioOption {
  value: string;
  label: string;
}

export interface FormRadioGroupProps {
  /** DOM id of the group; the first radio gets it too (focus target on error). */
  id: string;
  name: string;
  label: string;
  description?: string;
  showDescription?: boolean;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  /** Fired when focus leaves the whole group. */
  onBlur?: () => void;
  /** State=Error: shows the message and puts every option in Error. */
  errorMessage?: string;
  required?: boolean;
}

/** Figma: Form / Radio Group (24:1677) — fieldset + legend. */
export function FormRadioGroup({
  id,
  name,
  label,
  description,
  showDescription = !!description,
  options,
  value,
  onChange,
  onBlur,
  errorMessage,
  required,
}: FormRadioGroupProps) {
  const descId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [showDescription && description ? descId : '', errorMessage ? errorId : ''].filter(Boolean).join(' ');

  const handleBlur = (e: FocusEvent<HTMLFieldSetElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
  };

  return (
    <fieldset
      id={id}
      className={styles.group}
      role="radiogroup"
      aria-describedby={describedBy || undefined}
      aria-invalid={errorMessage ? true : undefined}
      aria-required={required || undefined}
      onBlur={handleBlur}
    >
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.body}>
        {showDescription && description && (
          <p id={descId} className={styles.description}>
            {description}
          </p>
        )}
        <div className={styles.options}>
          {options.map((opt, i) => (
            <FormRadio
              key={opt.value}
              id={i === 0 ? `${id}-input` : undefined}
              name={name}
              value={opt.value}
              label={opt.label}
              checked={value === opt.value}
              onChange={onChange}
              invalid={!!errorMessage}
            />
          ))}
        </div>
        {errorMessage && (
          <p id={errorId} className={styles.error}>
            {errorMessage}
          </p>
        )}
      </div>
    </fieldset>
  );
}
