import logoIcon from '../../assets/images/mercosul-logo-icon.png';
import { Icon } from '../Icon/Icon';
import styles from './HeaderDesktop.module.css';

export interface HeaderDesktopProps {
  /** Figma "Title" property. */
  title: string;
  /** Style=With Company Info shows CNPJ / IE / company; Style=Default hides it. */
  style?: 'with-company-info' | 'default';
  company: { taxId: string; stateRegistration: string; name: string };
  userName: string;
  whatsapp: { href: string; display: string };
  /** Mobile only: opens the Side Menu drawer. */
  onMenuClick?: () => void;
  menuOpen?: boolean;
  menuControlsId?: string;
}

/**
 * Figma: Header / Desktop (5:1570). WhatsApp opens in a new tab; the company
 * chevron and the user menu are inert (no dropdown) — SPEC §5.
 */
export function HeaderDesktop({
  title,
  style = 'with-company-info',
  company,
  userName,
  whatsapp,
  onMenuClick,
  menuOpen = false,
  menuControlsId,
}: HeaderDesktopProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleInfo}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls={menuControlsId}
          onClick={onMenuClick}
        >
          <span className={styles.menuBars} aria-hidden="true" />
        </button>
        <img className={styles.mobileLogo} src={logoIcon} alt="Mercosul Line" />
        <p className={styles.title}>{title}</p>
        {style === 'with-company-info' && (
          <>
            <span className={styles.divider} aria-hidden="true" />
            <div className={styles.company}>
              <div className={styles.companyRow}>
                <span className={styles.companyStrong}>CNPJ / CUIT / RUT: {company.taxId}</span>
                <span className={styles.shortDivider} aria-hidden="true" />
                <span className={styles.companyStrong}>INSCRIÇĀO ESTADUAL: {company.stateRegistration}</span>
                <Icon name="chevron" size={16} tone="muted" />
              </div>
              <span className={styles.companyName}>{company.name}</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <a
          className={styles.whatsapp}
          href={whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${whatsapp.display} (abre em nova aba)`}
        >
          <span className={styles.whatsappBadge}>
            <Icon name="whatsapp" size={24} tone="on-brand" className={styles.whatsappGlyph} />
          </span>
          <span className={styles.whatsappText}>
            <span className={styles.whatsappLabel}>Whatsapp</span>
            <span className={styles.whatsappNumber}>{whatsapp.display}</span>
          </span>
        </a>
        <div className={styles.user}>
          <span className={styles.userRow}>
            <Icon name="user" size={24} tone="primary" />
            <span className={styles.userName}>Olá, {userName}</span>
          </span>
          <Icon name="chevron" size={16} tone="muted" />
        </div>
      </div>
    </header>
  );
}
