import { Icon } from '../Icon/Icon';
import styles from './UploadFileItem.module.css';

export type FileItemState = 'uploading' | 'done' | 'error';

export interface UploadFileItemProps {
  fileName: string;
  /** Already formatted, e.g. "2,4 MB". */
  fileSize: string;
  state: FileItemState;
  /** 0–100, used in State=Uploading. */
  progress?: number;
  errorMessage?: string;
  onRemove: () => void;
}

/** Figma: Upload / File Item (25:1719). Uploading → Done, or Error with message. */
export function UploadFileItem({ fileName, fileSize, state, progress = 0, errorMessage, onRemove }: UploadFileItemProps) {
  return (
    <li className={`${styles.item} ${state === 'error' ? styles.itemError : ''}`} data-state={state}>
      <Icon name="bulletin" size={24} tone="primary" />
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{fileName}</span>
          <span className={styles.size}>{fileSize}</span>
          <span className="visually-hidden">
            {state === 'uploading' ? 'Enviando' : state === 'done' ? 'Enviado' : 'Recusado'}
          </span>
        </div>
        {state === 'uploading' && (
          <div
            className={styles.progress}
            role="progressbar"
            aria-label={`Enviando ${fileName}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
        {state === 'error' && errorMessage && <p className={styles.message}>{errorMessage}</p>}
      </div>
      <button type="button" className={styles.remove} aria-label={`Remover ${fileName}`} onClick={onRemove}>
        <Icon name="close" size={24} tone="muted" />
      </button>
    </li>
  );
}
