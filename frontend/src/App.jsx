import React, { useState } from 'react';
import './styles/global.css';
import HomePage      from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [page,    setPage]    = useState('home');   // 'home' | 'dashboard'
  const [filters, setFilters] = useState({});
  const [dashboardSection, setDashboardSection] = useState('jobs');

  const goToDashboard = (f = {}, section = 'jobs') => {
    setFilters(f);
    setDashboardSection(section);
    setPage('dashboard');
  };

  const goToHome = () => setPage('home');

  if (page === 'dashboard') {
    return (
      <DashboardPage
        initialFilters={filters}
        initialSection={dashboardSection}
        onNavigateHome={goToHome}
        onNavigateDashboardSection={setDashboardSection}
      />
    );
  }

  return (
    <HomePage onNavigateDashboard={goToDashboard} />
  );
}
