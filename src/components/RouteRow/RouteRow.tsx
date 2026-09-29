import { Button } from '../Button/Button';
import { FormDropdown, type DropdownOption } from '../FormDropdown/FormDropdown';
import styles from './RouteRow.module.css';

export type RouteRowField = 'cidadeColeta' | 'portoOrigem' | 'portoDestino' | 'cidadeEntrega';

const FIELD_LABELS: Record<RouteRowField, string> = {
  cidadeColeta: 'Cidade de coleta (caso PORTA)',
  portoOrigem: 'Porto de origem (caso PORTO)',
  portoDestino: 'Porto de destino (caso PORTO)',
  cidadeEntrega: 'Cidade de entrega (caso PORTA)',
};

const FIELD_ORDER: RouteRowField[] = ['cidadeColeta', 'portoOrigem', 'portoDestino', 'cidadeEntrega'];

export interface RouteRowProps {
  /** Type=First (Trecho 1, no header) | Additional (Trecho 2–5, "Remover trecho"). */
  type: 'first' | 'additional';
  title: string;
  /** Fields that apply to the chosen Modalidade. Empty → the 4 fields, disabled. */
  visibleFields: RouteRowField[];
  values: Record<RouteRowField, string>;
  optionsFor: (field: RouteRowField) => DropdownOption[];
  fieldId: (field: RouteRowField) => string;
  errorFor: (field: RouteRowField) => string | undefined;
  onChange: (field: RouteRowField, value: string) => void;
  onBlur: (field: RouteRowField) => void;
  onRemove?: () => void;
}

/** Figma: Route Row (26:1256). */
export function RouteRow({
  type,
  title,
  visibleFields,
  values,
  optionsFor,
  fieldId,
  errorFor,
  onChange,
  onBlur,
  onRemove,
}: RouteRowProps) {
  const noModality = visibleFields.length === 0;
  const fields = noModality ? FIELD_ORDER : FIELD_ORDER.filter((f) => visibleFields.includes(f));
  const titleId = `${fieldId(FIELD_ORDER[0])}-title`;

  return (
    <div
      className={styles.row}
      role="group"
      aria-labelledby={type === 'additional' ? titleId : undefined}
      aria-label={type === 'first' ? title : undefined}
    >
      {type === 'additional' && (
        <div className={styles.header}>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          <Button variant="link" size="small" label="Remover trecho" aria-label={`Remover ${title}`} onClick={onRemove} />
        </div>
      )}
      <div className={`${styles.fields} ${fields.length === 4 ? styles.four : styles.two}`}>
        {fields.map((field) => (
          <FormDropdown
            key={field}
            id={fieldId(field)}
            label={FIELD_LABELS[field]}
            value={values[field]}
            options={optionsFor(field)}
            disabled={noModality}
            required={!noModality}
            errorMessage={noModality ? undefined : errorFor(field)}
            onChange={(v) => onChange(field, v)}
            onBlur={() => onBlur(field)}
          />
        ))}
      </div>
    </div>
  );
}
