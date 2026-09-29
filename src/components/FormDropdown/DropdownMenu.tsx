import { useEffect, useRef } from 'react';
import { DropdownItem } from './DropdownItem';
import type { DropdownOption } from './FormDropdown';
import styles from './FormDropdown.module.css';

interface DropdownMenuProps {
  id: string;
  labelledBy: string;
  options: DropdownOption[];
  selectedIndex: number;
  activeIndex: number;
  optionId: (index: number) => string;
  onHover: (index: number) => void;
  onChoose: (index: number) => void;
}

/** Figma: Dropdown / Menu (5:2484) — list scrolls after 5 items (Items=5). */
export function DropdownMenu({ id, labelledBy, options, selectedIndex, activeIndex, optionId, onHover, onChoose }: DropdownMenuProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <ul ref={listRef} id={id} role="listbox" aria-labelledby={labelledBy} className={styles.menu} tabIndex={-1}>
      {options.map((opt, i) => (
        <DropdownItem
          key={opt.value}
          id={optionId(i)}
          index={i}
          label={opt.label}
          selected={i === selectedIndex}
          active={i === activeIndex}
          onHover={onHover}
          onChoose={onChoose}
        />
      ))}
    </ul>
  );
}
