import { Icon } from '../Icon/Icon';
import styles from './ContractorPanel.module.css';

export interface ContractorPanelProps {
  /** State=Expanded | Collapsed (only the "»" tab is visible). */
  state: 'expanded' | 'collapsed';
  onToggle: () => void;
  company: { name: string; taxId: string; stateRegistration: string; freightNote: string };
  /** Figma "Show Proposal Data" — out of scope, always off (SPEC §1). */
  showProposalData?: false;
}

/** Figma: Quotation / Contractor Panel / Desktop (5:1652). */
export function ContractorPanel({ state, onToggle, company }: ContractorPanelProps) {
  const expanded = state === 'expanded';
  return (
    <aside className={`${styles.panel} ${expanded ? styles.expanded : styles.collapsed}`} data-state={state} aria-label="Painel do contratante">
      <button
        type="button"
        className={styles.tab}
        aria-expanded={expanded}
        aria-controls="contractor-panel-body"
        aria-label={expanded ? 'Recolher painel do contratante' : 'Expandir painel do contratante'}
        onClick={onToggle}
      >
        <Icon name="panelArrow" size={16} tone="disabled" rotate={expanded ? 0 : 180} className={styles.arrow} />
      </button>

      <div id="contractor-panel-body" className={styles.body} hidden={!expanded}>
        <div className={styles.company}>
          <span className={styles.companyLabel}>Empresa</span>
          <span className={styles.companyName}>{company.name}</span>
        </div>
        <div className={styles.status}>
          <Icon name="warning" size={20} tone="warning" />
          <span>{company.freightNote}</span>
        </div>
        <div className={styles.details}>
          <section className={styles.contractor} aria-labelledby="contractor-title">
            <h2 id="contractor-title" className={styles.sectionTitle}>
              <Icon name="info" size={24} tone="muted" />
              Dados do contratante
            </h2>
            <dl className={styles.info}>
              <div className={styles.infoRow}>
                <dt>CNPJ / CUT / RUIT:</dt>
                <dd>{company.taxId}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Inscrição Estadual:</dt>
                <dd>{company.stateRegistration}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </aside>
  );
}
