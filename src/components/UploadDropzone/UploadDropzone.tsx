import { forwardRef, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './UploadDropzone.module.css';

export type DropzoneState = 'default' | 'drag-over' | 'error';

export interface UploadDropzoneProps {
  id: string;
  /** id of the visible field label. */
  labelledBy: string;
  onFiles: (files: File[]) => void;
  /** State=Error — the last batch had a rejected file (or the field is invalid). */
  error?: boolean;
  describedBy?: string;
  accept?: string;
}

/**
 * Figma: Upload / Dropzone (25:1664). Drag & drop or "Busque no seu computador".
 * State=Drag Over while a file hovers the area. Activated with Enter/Space.
 */
export const UploadDropzone = forwardRef<HTMLDivElement, UploadDropzoneProps>(function UploadDropzone(
  { id, labelledBy, onFiles, error = false, describedBy, accept = '.pdf,.jpg,.jpeg,.png' },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [dragOver, setDragOver] = useState(false);
  const state: DropzoneState = dragOver ? 'drag-over' : error ? 'error' : 'default';
  const hintId = `${id}-hint`;

  const browse = () => inputRef.current?.click();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      browse();
    }
  };

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files');

  return (
    <div
      ref={ref}
      id={id}
      role="button"
      tabIndex={0}
      aria-labelledby={`${labelledBy} ${id}-text`}
      aria-describedby={[hintId, describedBy].filter(Boolean).join(' ')}
      aria-invalid={error || undefined}
      className={`${styles.dropzone} ${styles[state]}`}
      data-state={state}
      onClick={browse}
      onKeyDown={onKeyDown}
      onDragEnter={(e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        depth.current += 1;
        setDragOver(true);
      }}
      onDragOver={(e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
    >
      <span className={styles.row}>
        <Icon name="upload" size={32} tone="muted" />
        <span id={`${id}-text`} className={styles.text}>
          Arraste aqui para fazer o upload do arquivo ou
        </span>
      </span>
      <Button presentational variant="primary" size="small" label="Busque no seu computador" />
      <span id={hintId} className="visually-hidden">
        Busque no seu computador. PDF, JPG ou PNG, até 10 MB cada.
      </span>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        multiple
        accept={accept}
        tabIndex={-1}
        aria-hidden="true"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />
    </div>
  );
});
