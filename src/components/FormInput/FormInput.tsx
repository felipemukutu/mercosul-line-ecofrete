import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import f from '../FormField/field.module.css';

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'prefix'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Direction=Vertical (label above) | Horizontal (label beside). */
  direction?: 'vertical' | 'horizontal';
  showLabel?: boolean;
  /** When set, State=Error with this message below the field. */
  errorMessage?: string;
  /** Adornments inside the field for formatted values (e.g. "kg", "°C"). */
  prefix?: ReactNode;
  suffix?: ReactNode;
}

/**
 * Figma: Form / Input (5:2300). State is derived: Disabled (`disabled`),
 * Error (`errorMessage`), Filled (has value), Hover/Active (CSS).
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    id,
    label,
    value,
    onChange,
    direction = 'vertical',
    showLabel = true,
    errorMessage,
    prefix,
    suffix,
    disabled,
    placeholder = 'Digite',
    className,
    ...rest
  },
  ref,
) {
  const errorId = `${id}-error`;
  const cls = [
    f.field,
    direction === 'horizontal' ? f.horizontal : '',
    errorMessage ? f.invalid : '',
    disabled ? f.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <label htmlFor={id} className={showLabel ? f.label : 'visually-hidden'}>
        {label}
      </label>
      <div className={f.box}>
        {prefix && value && <span className={f.affix} aria-hidden="true">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          className={f.control}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
        {suffix && value && <span className={f.affix} aria-hidden="true">{suffix}</span>}
      </div>
      {errorMessage && (
        <p id={errorId} className={f.error}>
          {errorMessage}
        </p>
      )}
    </div>
  );
});
