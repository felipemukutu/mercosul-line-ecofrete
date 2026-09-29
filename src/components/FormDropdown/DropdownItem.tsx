import styles from './FormDropdown.module.css';

interface DropdownItemProps {
  id: string;
  index: number;
  label: string;
  selected: boolean;
  active: boolean;
  onHover: (index: number) => void;
  onChoose: (index: number) => void;
}

/** Figma: Dropdown / Item (5:2739) — option row of Dropdown / Menu. */
export function DropdownItem({ id, index, label, selected, active, onHover, onChoose }: DropdownItemProps) {
  return (
    <li
      id={id}
      role="option"
      data-index={index}
      aria-selected={selected}
      className={[styles.item, active ? styles.itemActive : '', selected ? styles.itemSelected : ''].filter(Boolean).join(' ')}
      // keep focus on the combobox button
      onPointerDown={(e) => e.preventDefault()}
      onPointerEnter={() => onHover(index)}
      onClick={() => onChoose(index)}
    >
      {label}
    </li>
  );
}
