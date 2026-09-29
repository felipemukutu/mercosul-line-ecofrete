import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '../Button/Button';
import { IconBadge } from '../IconBadge/IconBadge';
import { RadioCard } from '../RadioCard/RadioCard';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './CargoTypeSelector.module.css';

export type CargoTypeSelectorState = 'collapsed' | 'open' | 'imo-selected';

export interface CargoOption {
  value: string;
  label: string;
  enabled: boolean;
}

export interface CargoTypeSelectorProps {
  title: string;
  description: string;
  options: readonly CargoOption[];
  /** Accordion open (State=Open / IMO Selected) or closed (State=Collapsed). */
  open: boolean;
  selected: string | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
  onAdvance: () => void;
  tooltipText?: string;
}

const TOOLTIP_DELAY = 300;

/**
 * Figma: Cargo Type Selector (1:917). Collapsed → "Selecionar carga" expands in
 * place (Open, nothing selected, "Avançar cotação" disabled). Only enabled
 * options are selectable; the others are State=Off with the "Em breve" tooltip.
 */
export function CargoTypeSelector({
  title,
  description,
  options,
  open,
  selected,
  onOpenChange,
  onSelect,
  onAdvance,
  tooltipText = 'Em breve',
}: CargoTypeSelectorProps) {
  const state: CargoTypeSelectorState = !open ? 'collapsed' : selected ? 'imo-selected' : 'open';
  const panelId = 'cargo-type-options';
  const headingId = 'cargo-type-title';
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tooltipFor, setTooltipFor] = useState<number | null>(null);
  const timer = useRef<number>();

  const selectedIndex = options.findIndex((o) => o.value === selected);
  const [focusIndex, setFocusIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) setTooltipFor(null);
  }, [open]);

  const scheduleTooltip = (index: number) => {
    window.clearTimeout(timer.current);
    if (options[index]?.enabled) return setTooltipFor(null);
    timer.current = window.setTimeout(() => setTooltipFor(index), TOOLTIP_DELAY);
  };
  const hideTooltip = () => {
    window.clearTimeout(timer.current);
    setTooltipFor(null);
  };

  const choose = (index: number) => {
    const opt = options[index];
    if (opt?.enabled) onSelect(opt.value);
  };

  // Radiogroup keyboard: arrows move focus (and select enabled options), Space selects.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const count = options.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % count;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + count) % count;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = count - 1;
    if (next >= 0) {
      e.preventDefault();
      setFocusIndex(next);
      cardRefs.current[next]?.focus();
      choose(next);
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      choose(index);
    }
  };

  const tabStop = selectedIndex >= 0 ? selectedIndex : focusIndex;

  return (
    <section className={`${styles.card} ${styles[state]}`} data-state={state} aria-labelledby={headingId}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.headerToggle}
          aria-expanded={open}
          aria-controls={panelId}
          tabIndex={open ? 0 : -1}
          onClick={() => onOpenChange(!open)}
        >
          <IconBadge icon="cargoSpecial" iconSize={48} />
          <span className={styles.texts}>
            <span id={headingId} className={styles.title}>
              {title}
            </span>
            <span className={styles.description}>{description}</span>
          </span>
        </button>
        {!open && (
          <Button
            variant="primary"
            size="medium"
            label="Selecionar carga"
            aria-expanded={false}
            aria-controls={panelId}
            onClick={() => onOpenChange(true)}
          />
        )}
      </div>

      <div id={panelId} className={styles.panel} hidden={!open}>
        {open && (
          <>
            <div className={styles.grid} role="radiogroup" aria-labelledby={headingId}>
              {options.map((opt, i) => {
                const tooltipId = `cargo-tooltip-${opt.value}`;
                return (
                  <RadioCard
                    key={opt.value}
                    ref={(el) => (cardRefs.current[i] = el)}
                    title={opt.label}
                    checked={opt.value === selected}
                    off={!opt.enabled}
                    tabIndex={i === tabStop ? 0 : -1}
                    aria-describedby={!opt.enabled ? tooltipId : undefined}
                    onClick={() => {
                      setFocusIndex(i);
                      choose(i);
                    }}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    onFocus={() => {
                      setFocusIndex(i);
                      scheduleTooltip(i);
                    }}
                    onBlur={hideTooltip}
                    onPointerEnter={() => scheduleTooltip(i)}
                    onPointerLeave={hideTooltip}
                    overlay={!opt.enabled ? <Tooltip id={tooltipId} text={tooltipText} visible={tooltipFor === i} /> : undefined}
                  />
                );
              })}
            </div>
            <div className={styles.footer}>
              <Button variant="primary" size="medium" label="Avançar cotação" disabled={!selected} onClick={onAdvance} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
