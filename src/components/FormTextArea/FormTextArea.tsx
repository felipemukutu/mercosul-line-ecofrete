import { type TextareaHTMLAttributes } from 'react';
import f from '../FormField/field.module.css';
import styles from './FormTextArea.module.css';

export interface FormTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
  showLabel?: boolean;
  errorMessage?: string;
}

/** Figma: Form / Text Area (5:2578) — multi-line field, 200 tall with its label (--size-textarea). */
export function FormTextArea({
  id,
  label,
  value,
  onChange,
  direction = 'vertical',
  showLabel = true,
  errorMessage,
  disabled,
  placeholder = 'Digite',
  ...rest
}: FormTextAreaProps) {
  const errorId = `${id}-error`;
  const cls = [
    f.field,
    styles.field,
    direction === 'horizontal' ? f.horizontal : '',
    errorMessage ? f.invalid : '',
    disabled ? f.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <label htmlFor={id} className={showLabel ? f.label : 'visually-hidden'}>
        {label}
      </label>
      <div className={`${f.box} ${styles.box}`}>
        <textarea
          id={id}
          className={`${f.control} ${styles.control}`}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      </div>
      {errorMessage && (
        <p id={errorId} className={f.error}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
