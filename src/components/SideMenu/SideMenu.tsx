import { useEffect, useRef, useState, type FocusEvent } from 'react';
import logoFull from '../../assets/images/mercosul-logo.png';
import logoIcon from '../../assets/images/mercosul-logo-icon.png';
import type { IconName } from '../Icon/Icon';
import { SideMenuItem } from './SideMenuItem';
import styles from './SideMenu.module.css';

type Entry = { label: string; icon: IconName; subitems?: string[] };

// SPEC §5 — item order; the active section is Sustentabilidade.
const GROUP_COMMERCIAL: Entry[] = [
  { label: 'Comercial', icon: 'proposals' },
  { label: 'Financeiro', icon: 'finance' },
  { label: 'Bookings', icon: 'booking' },
  { label: 'VGM', icon: 'vgm' },
];
const GROUP_OPERATIONS: Entry[] = [
  { label: 'Draft', icon: 'vgm' },
  { label: 'Track & Trace', icon: 'trackTrace' },
  { label: 'Agendamento de Entrega', icon: 'transport' },
];
const SUSTAINABILITY: Entry = {
  label: 'Sustentabilidade',
  icon: 'sustainability',
  subitems: ['Compensação de Emissões de CO₂', 'Relatórios', 'Emissões e Savings'],
};
const GROUP_ADMIN: Entry[] = [
  { label: 'Informativos', icon: 'bulletin' },
  { label: 'Usuários', icon: 'users' },
];
const HELP: Entry = { label: 'Ajuda', icon: 'help' };

export interface SideMenuProps {
  id: string;
  /** Figma "Type": the active section. */
  type?: 'sustentabilidade';
  /** Mobile drawer open (SPEC §11, mobile range). */
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

/**
 * Figma: Side Menu (5:1755). --size-side-menu wide when collapsed; State=Expanded on hover/focus,
 * overlaying the content without pushing it.
 */
export function SideMenu({ id, type = 'sustentabilidade', drawerOpen = false, onDrawerClose }: SideMenuProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const expanded = hovered || focused || drawerOpen;

  useEffect(() => {
    if (!drawerOpen) return;
    navRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDrawerClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, onDrawerClose]);

  const onBlur = (e: FocusEvent) => {
    if (!navRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  const sustainabilityActive = type === 'sustentabilidade';

  return (
    <>
      {drawerOpen && <div className={styles.backdrop} onClick={onDrawerClose} aria-hidden="true" />}
      <nav
        ref={navRef}
        id={id}
        aria-label="Menu principal"
        className={[styles.sideMenu, expanded ? styles.expanded : '', drawerOpen ? styles.drawerOpen : ''].filter(Boolean).join(' ')}
        data-state={expanded ? 'expanded' : 'collapsed'}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
      >
        <div className={styles.logo}>
          <img className={styles.logoIcon} src={logoIcon} alt={expanded ? '' : 'Mercosul Line'} />
          <img className={styles.logoFull} src={logoFull} alt={expanded ? 'Mercosul Line' : ''} />
        </div>
        <div className={styles.menu}>
          <ul className={styles.pages}>
            <li className={styles.group}>
              <ul>
                {GROUP_COMMERCIAL.map((e) => (
                  <li key={e.label}>
                    <SideMenuItem label={e.label} icon={e.icon} />
                  </li>
                ))}
              </ul>
            </li>
            {GROUP_OPERATIONS.map((e) => (
              <li key={e.label}>
                <SideMenuItem label={e.label} icon={e.icon} />
              </li>
            ))}
            <li className={sustainabilityActive && expanded ? styles.activeSection : styles.section}>
              <SideMenuItem label={SUSTAINABILITY.label} icon={SUSTAINABILITY.icon} active={sustainabilityActive} open={expanded} />
              {expanded && (
                <ul className={styles.subitems}>
                  {SUSTAINABILITY.subitems!.map((s) => (
                    <li key={s}>
                      <SideMenuItem itemStyle="subitem" label={s} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li className={styles.divider} aria-hidden="true" />
            {GROUP_ADMIN.map((e) => (
              <li key={e.label}>
                <SideMenuItem label={e.label} icon={e.icon} />
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <SideMenuItem label={HELP.label} icon={HELP.icon} />
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
