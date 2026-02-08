
import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import ArtistSetup from './pages/ArtistSetup';
import Dashboard from './pages/Dashboard';
import CityDetail from './pages/CityDetail';
import Venues from './pages/Venues';
import Tour from './pages/Tour';
import PerformanceDetail from './pages/PerformanceDetail';
import Settings from './pages/Settings';
import { AppProvider, useApp } from './context/AppContext';

function Header(){
  const { state } = useApp();
  const loggedIn = !!state.user;

  return (
    <div className="header">
      <div className="container nav nav-3col">
        
        {/* LEFT */}
        <div className="nav-left">
          <strong style={{ color: 'var(--bg)', fontSize: 28 }}>
            Sonar
          </strong>
        </div>

        {/* CENTER */}
        <div className="nav-center">
          {loggedIn && (
            <>
              <NavLink to="/dashboard" className={({isActive})=> isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
              <NavLink to="/tour" className={({isActive})=> isActive ? 'active' : ''}>
                Tour
              </NavLink>
              <NavLink to="/settings" className={({isActive})=> isActive ? 'active' : ''}>
                Settings
              </NavLink>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          {loggedIn ? `Hey musician!` : ''}
        </div>

      </div>
    </div>
  );
}


function Shell(){
  const { state } = useApp();
  const navigate = useNavigate();
  React.useEffect(()=>{
    if(!state.user){ navigate('/'); }
  },[state.user]);
  return (
    <div>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/city/:cityId" element={<CityDetail />} />
          <Route path="/venues/:cityId" element={<Venues />} />
          <Route path="/tour" element={<Tour />} />
          <Route path="/performance/:id" element={<PerformanceDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/setup" element={<ArtistSetup />} />
        <Route path="/*" element={<Shell />} />
      </Routes>
    </AppProvider>
  )
}
