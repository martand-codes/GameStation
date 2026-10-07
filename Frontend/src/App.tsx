import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth';
import Dashboard from './Pages/Dashboard';
import DeveloperPortal from './Pages/DeveloperPortal';
import GameConfig from './Pages/GameConfig';
import DeveloperLayout from './Layouts/DeveloperLayout';
import DeveloperDashboard from './Pages/DeveloperDashboard';
import DeveloperAnalytics from './Pages/DeveloperAnalytics';
import DeveloperRevenue from './Pages/DeveloperRevenue';
import { useAuth } from './Context/AuthContext';
import StorefrontLayout from './Layouts/StorefrontLayout';
import Home from './Pages/Storefront/Home';
import GameDetails from './Pages/Storefront/GameDetails';

const App = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/store" : "/auth"} />} />
      <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/store" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Navigate to="/store" /> : <Navigate to="/auth" />} />
      <Route path="/developer" element={isAuthenticated ? <DeveloperLayout /> : <Navigate to="/auth" />}>
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="portal" element={<DeveloperPortal />} />
        <Route path="games/:id" element={<GameConfig />} />
        <Route path="analytics" element={<DeveloperAnalytics />} />
        <Route path="revenue" element={<DeveloperRevenue />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>
      <Route path="/store" element={isAuthenticated ? <StorefrontLayout /> : <Navigate to="/auth" />}>
        <Route index element={<Home />} />
        <Route path="games/:id" element={<GameDetails />} />
      </Route>
    </Routes>
  )
}

export default App
