import type { ComponentType, SVGProps } from 'react';
import Booking from '../../assets/icons/booking.svg?react';
import Bulletin from '../../assets/icons/bulletin.svg?react';
import CargoSpecial from '../../assets/icons/cargo-special.svg?react';
import Check from '../../assets/icons/check.svg?react';
import CheckCircle from '../../assets/icons/check-circle.svg?react';
import Chevron from '../../assets/icons/chevron.svg?react';
import Close from '../../assets/icons/close.svg?react';
import Finance from '../../assets/icons/finance.svg?react';
import Help from '../../assets/icons/help.svg?react';
import Info from '../../assets/icons/info.svg?react';
import PanelArrow from '../../assets/icons/panel-arrow.svg?react';
import Proposals from '../../assets/icons/proposals.svg?react';
import Spinner from '../../assets/icons/spinner.svg?react';
import Sustainability from '../../assets/icons/sustainability.svg?react';
import TrackTrace from '../../assets/icons/track-trace.svg?react';
import Transport from '../../assets/icons/transport.svg?react';
import Upload from '../../assets/icons/upload.svg?react';
import User from '../../assets/icons/user.svg?react';
import Users from '../../assets/icons/users.svg?react';
import Vgm from '../../assets/icons/vgm.svg?react';
import Warning from '../../assets/icons/warning.svg?react';
import Whatsapp from '../../assets/icons/whatsapp.svg?react';
import styles from './Icon.module.css';

/** Icons exported from the Figma page "Componentes" (Icon / {size} / {name}). */
const ICONS = {
  chevron: Chevron,
  user: User,
  info: Info,
  warning: Warning,
  upload: Upload,
  check: Check,
  close: Close,
  checkCircle: CheckCircle,
  spinner: Spinner,
  proposals: Proposals,
  finance: Finance,
  booking: Booking,
  vgm: Vgm,
  trackTrace: TrackTrace,
  transport: Transport,
  sustainability: Sustainability,
  bulletin: Bulletin,
  users: Users,
  help: Help,
  whatsapp: Whatsapp,
  panelArrow: PanelArrow,
  cargoSpecial: CargoSpecial,
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

export type IconName = keyof typeof ICONS;
export type IconSize = 16 | 18 | 20 | 24 | 32 | 48;
/** Maps to color/icon/* — the only source of icon color. */
export type IconTone =
  | 'primary'
  | 'strong'
  | 'muted'
  | 'accent'
  | 'warning'
  | 'disabled'
  | 'on-brand'
  | 'secondary'
  | 'success';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  /** Rotation used by chevrons/arrows (open/closed). */
  rotate?: 0 | 90 | 180 | 270;
  spin?: boolean;
  className?: string;
}

const TONE_CLASS: Record<IconTone, string> = {
  primary: styles.tonePrimary,
  strong: styles.toneStrong,
  muted: styles.toneMuted,
  accent: styles.toneAccent,
  warning: styles.toneWarning,
  disabled: styles.toneDisabled,
  'on-brand': styles.toneOnBrand,
  secondary: styles.toneSecondary,
  success: styles.toneSuccess,
};

export function Icon({ name, size = 24, tone = 'muted', rotate = 0, spin = false, className }: IconProps) {
  const Svg = ICONS[name];
  const cls = [
    styles.icon,
    styles[`size${size}`],
    TONE_CLASS[tone],
    rotate ? styles[`rotate${rotate}`] : '',
    spin ? styles.spin : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <Svg className={cls} />;
}
