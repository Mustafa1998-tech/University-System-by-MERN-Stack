import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LayoutShell from './components/layout/LayoutShell';
import DashboardPage from './pages/app/DashboardPage';
import ModulePage from './pages/app/ModulePage';
import AnalyticsPage from './pages/app/AnalyticsPage';
import SettingsPage from './pages/app/SettingsPage';
import NotFoundPage from './pages/app/NotFoundPage';
import { AppUIProvider } from './context/AppUIContext';
import './styles/main.scss';

function App() {
  return (
    <AppUIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LayoutShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="modules/:moduleId" element={<ModulePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AppUIProvider>
  );
}

export default App;
