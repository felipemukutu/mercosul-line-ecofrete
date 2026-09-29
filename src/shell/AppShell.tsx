import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ContractorPanel } from '../components/ContractorPanel/ContractorPanel';
import { HeaderDesktop } from '../components/HeaderDesktop/HeaderDesktop';
import { SideMenu } from '../components/SideMenu/SideMenu';
import { desktopQuery, useMediaQuery } from '../hooks/useMediaQuery';
import { MOCK_COMPANY, MOCK_USER, WHATSAPP_URL } from '../state/mockData';
import styles from './AppShell.module.css';

const SIDE_MENU_ID = 'side-menu';

/** Header + Side Menu + content + Contractor Panel (SPEC §5). */
export function AppShell() {
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(desktopQuery());
  const [menuOpen, setMenuOpen] = useState(false);
  // Panel: open on /cotacao, collapsed on /cotacao/imo. Below the desktop breakpoint it is a drawer, closed by default.
  const [panelExpanded, setPanelExpanded] = useState(isDesktop && pathname === '/cotacao');

  useEffect(() => {
    setPanelExpanded(isDesktop && pathname === '/cotacao');
    setMenuOpen(false);
  }, [pathname, isDesktop]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className={styles.shell}>
      <SideMenu id={SIDE_MENU_ID} drawerOpen={menuOpen} onDrawerClose={closeMenu} />
      <div className={styles.area}>
        <div className={styles.header}>
          <HeaderDesktop
            title="Proposta Online"
            company={{ taxId: MOCK_COMPANY.taxId, stateRegistration: MOCK_COMPANY.stateRegistration, name: MOCK_COMPANY.headerName }}
            userName={MOCK_USER.firstName}
            whatsapp={{ href: WHATSAPP_URL, display: MOCK_COMPANY.whatsappDisplay }}
            menuOpen={menuOpen}
            menuControlsId={SIDE_MENU_ID}
            onMenuClick={() => setMenuOpen((o) => !o)}
          />
        </div>
        <div className={styles.body}>
          <main className={styles.main}>
            <Outlet />
          </main>
          <ContractorPanel
            state={panelExpanded ? 'expanded' : 'collapsed'}
            onToggle={() => setPanelExpanded((v) => !v)}
            company={MOCK_COMPANY}
          />
        </div>
      </div>
    </div>
  );
}
