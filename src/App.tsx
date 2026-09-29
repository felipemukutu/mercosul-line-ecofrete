import { Navigate, Route, Routes } from 'react-router-dom';
import { CargoDataPage } from './pages/CargoDataPage';
import { ImoFormPage } from './pages/ImoFormPage';
import { AppShell } from './shell/AppShell';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/cotacao" element={<CargoDataPage />} />
        <Route path="/cotacao/imo" element={<ImoFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/cotacao" replace />} />
    </Routes>
  );
}
