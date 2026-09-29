import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Desktop breakpoint, read from tokens.css (--bp-desktop-min) so CSS and JS share one value. */
export const desktopQuery = () =>
  `(min-width: ${getComputedStyle(document.documentElement).getPropertyValue('--bp-desktop-min').trim() || '100vw'})`;
