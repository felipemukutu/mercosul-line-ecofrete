import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../Icon/Icon';
import f from '../FormField/field.module.css';
import { DropdownMenu } from './DropdownMenu';
import styles from './FormDropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface FormDropdownProps {
  id: string;
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Fired when focus leaves the control with the menu closed (validation on blur). */
  onBlur?: () => void;
  placeholder?: string;
  direction?: 'vertical' | 'horizontal';
  showLabel?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  required?: boolean;
}

/**
 * Figma: Form / Dropdown (5:2354) — select-only combobox.
 * States: Default, Active (focus), Open (menu visible), Error, Disabled.
 * Keyboard: Enter/Space/↓/↑ open · ↑/↓/Home/End navigate · Enter/Space select · Esc/Tab close.
 */
export function FormDropdown({
  id,
  label,
  value,
  options,
  onChange,
  onBlur,
  placeholder = 'Selecione',
  direction = 'vertical',
  showLabel = true,
  disabled = false,
  errorMessage,
  required,
}: FormDropdownProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const optionId = (i: number) => `${uid}-opt-${i}`;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const openMenu = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    if (disabled) return;
    setActive(index);
    setOpen(true);
  };
  const closeMenu = () => setOpen(false);
  const choose = (index: number) => {
    const opt = options[index];
    if (opt) onChange(opt.value);
    closeMenu();
    buttonRef.current?.focus();
  };

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const last = options.length - 1;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openMenu(e.key === 'ArrowUp' ? (selectedIndex >= 0 ? selectedIndex : last) : undefined);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu();
        break;
    }
  };

  const cls = [
    f.field,
    styles.dropdown,
    direction === 'horizontal' ? f.horizontal : '',
    errorMessage ? `${f.invalid} ${styles.invalid}` : '',
    disabled ? styles.disabled : '',
    open ? styles.open : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} ref={rootRef}>
      <label
        id={labelId}
        htmlFor={id}
        className={showLabel ? f.label : 'visually-hidden'}
        onClick={(e) => {
          e.preventDefault();
          buttonRef.current?.focus();
        }}
      >
        {label}
      </label>
      <div className={styles.anchor}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="combobox"
          className={`${f.box} ${styles.box}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${id}`}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
            closeMenu();
            onBlur?.();
          }}
        >
          <span className={selected ? styles.value : styles.placeholder}>{selected ? selected.label : placeholder}</span>
          <Icon name="chevron" size={16} tone="muted" rotate={open ? 180 : 0} />
        </button>
        {open && (
          <DropdownMenu
            id={listId}
            labelledBy={labelId}
            options={options}
            selectedIndex={selectedIndex}
            activeIndex={active}
            optionId={optionId}
            onHover={setActive}
            onChoose={choose}
          />
        )}
      </div>
      {errorMessage && (
        <p id={errorId} className={f.error}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
