import type { ReactNode } from 'react';
import ecofreteLogo from '../../assets/images/ecofrete-logo.png';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { IconBadge } from '../IconBadge/IconBadge';
import styles from './Layout.module.css';

/*
 * Layout pieces that mirror the role-named frames of the Figma screens
 * ("Card / …", "Field Row", "Titulo", "Dados da Carga", "Add Route").
 * They are frames — not Figma components — so they only arrange components.
 */

/** Frame "Card / …" of the IMO form: white card, top border, space/32 padding. */
export function FormCard({ children, gap = 'lg' }: { children: ReactNode; gap?: 'md' | 'lg' }) {
  return <div className={`${styles.formCard} ${gap === 'md' ? styles.gapMd : styles.gapLg}`}>{children}</div>;
}

/** Frame "Field Row": fields side by side (2 or 4 per row on desktop). */
export function FieldRow({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 4 }) {
  return <div className={`${styles.fieldRow} ${columns === 4 ? styles.four : styles.two}`}>{children}</div>;
}

/** Frame "Stack / …": a question followed by its conditional fields. */
export function QuestionStack({ children }: { children: ReactNode }) {
  return <div className={styles.questionStack}>{children}</div>;
}

/** Conditional fields appear right below the question with a short transition (≤ 200 ms). */
export function Reveal({ children }: { children: ReactNode }) {
  return <div className={styles.reveal}>{children}</div>;
}

/** Frame "Titulo" of the first step. */
export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.pageHeading}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <p className={styles.pageDescription}>{description}</p>
    </div>
  );
}

/** Frame "Dados da Carga" (top bar of the IMO form). */
export function CargoSummary({ cargoLabel, onChange }: { cargoLabel: string; onChange: () => void }) {
  return (
    <div className={styles.cargoSummary}>
      <div className={styles.cargoSummaryTitle}>
        <span className={styles.cargoSummaryLabel}>
          <Icon name="info" size={24} tone="muted" />
          Dados da carga:
        </span>
        <span className={styles.cargoSummaryValue}>{cargoLabel}</span>
      </div>
      <Button variant="secondary" size="medium" label="Alterar carga" onClick={onChange} />
    </div>
  );
}

/** Frame "Card / Outros tipos de cargas" — "Avançar cotação" is inert (SPEC §6). */
export function OtherCargoCard({ off }: { off: boolean }) {
  return (
    <section className={`${styles.optionCard} ${off ? styles.optionCardOff : ''}`} aria-labelledby="other-cargo-title">
      <div className={styles.optionCardRow}>
        <IconBadge icon="proposals" />
        <div className={styles.optionCardTexts}>
          <h2 id="other-cargo-title" className={styles.optionCardTitle}>
            Outros tipos de cargas
          </h2>
          <p className={styles.optionCardDescription}>Lorem ipsum</p>
        </div>
      </div>
      <Button variant="primary" size="medium" label="Avançar cotação" />
    </section>
  );
}

/** Frame "Add Route Button". Hidden at the 5-segment limit. */
export function AddRouteButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.addRoute} onClick={onClick}>
      + Adicionar trecho
    </button>
  );
}

/** Frame "Row / Deseja utilizar o Ecofrete…": Ecofrete logo + the question. */
export function EcofreteRow({ children }: { children: ReactNode }) {
  return (
    <div className={styles.ecofreteRow}>
      <div className={styles.ecofreteFrame}>
        <img className={styles.ecofreteImage} src={ecofreteLogo} alt="Ecofrete" />
      </div>
      <div className={styles.ecofreteQuestion}>{children}</div>
    </div>
  );
}
