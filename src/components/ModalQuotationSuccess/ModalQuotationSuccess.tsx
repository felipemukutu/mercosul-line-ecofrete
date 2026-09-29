import { useEffect, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import ecofreteSeal from '../../assets/images/ecofrete-seal.png';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './ModalQuotationSuccess.module.css';

export interface ModalQuotationSuccessProps {
  open: boolean;
  title?: string;
  message?: string;
  /** Figma "Show Ecofrete Seal" — true when the user answered Sim to Ecofrete. */
  showEcofreteSeal: boolean;
  /** "Nova cotação" (Secondary): resets the flow. */
  onNewQuotation: () => void;
  /** "Visualizar propostas" (Primary) and Esc: only close. */
  onClose: () => void;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Figma: Modal / Quotation Success (22:1108). role="dialog" + aria-modal,
 * initial focus on the primary button, focus trapped, Esc closes, the overlay
 * does NOT close it.
 */
export function ModalQuotationSuccess({
  open,
  title = 'Cotação solicitada com sucesso!',
  message = 'Recebemos sua solicitação de cotação para Carga IMO. Você será notificado quando a proposta estiver disponível.',
  showEcofreteSeal,
  onNewQuotation,
  onClose,
}: ModalQuotationSuccessProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    // Esc closes even if focus somehow left the dialog.
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    // The overlay never closes the modal; mousedown is swallowed so focus stays trapped inside.
    <div className={styles.overlay} onKeyDown={onKeyDown} onMouseDown={(e) => e.target === e.currentTarget && e.preventDefault()}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotation-success-title"
        aria-describedby="quotation-success-message"
      >
        <header className={styles.header}>
          <h2 id="quotation-success-title" className={styles.title}>
            {title}
          </h2>
        </header>
        <div className={styles.body}>
          <div className={styles.messageRow}>
            <Icon name="checkCircle" size={48} tone="success" />
            <p id="quotation-success-message" className={styles.message}>
              {message}
            </p>
          </div>
          {showEcofreteSeal && (
            <div className={styles.seal}>
              <img className={styles.sealLogo} src={ecofreteSeal} alt="Ecofrete" />
              <p className={styles.sealText}>As emissões de CO₂ desta operação serão compensadas pelo Ecofrete.</p>
            </div>
          )}
        </div>
        <footer className={styles.footer}>
          <Button variant="secondary" size="medium" label="Nova cotação" onClick={onNewQuotation} />
          <Button ref={primaryRef} variant="primary" size="medium" label="Visualizar propostas" onClick={onClose} />
        </footer>
      </div>
    </div>,
    document.body,
  );
}
