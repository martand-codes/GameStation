import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth';
import DeveloperPortal from './Pages/DeveloperPortal';
import GameConfig from './Pages/GameConfig';
import DeveloperLayout from './Layouts/DeveloperLayout';
import DeveloperDashboard from './Pages/DeveloperDashboard';
import DeveloperAnalytics from './Pages/DeveloperAnalytics';
import DeveloperRevenue from './Pages/DeveloperRevenue';
import CreateGame from './Pages/CreateGame';
import { useAuth } from './Context/AuthContext';
import StorefrontLayout from './Layouts/StorefrontLayout';
import Home from './Pages/Storefront/Home';
import GameDetails from './Pages/Storefront/GameDetails';
import PaymentSuccess from './Pages/Storefront/PaymentSuccess';
import PaymentCancelled from './Pages/Storefront/PaymentCancelled';
import Library from './Pages/Storefront/Library';
import Profile from './Pages/Storefront/Profile';
import Wallet from './Pages/Storefront/Wallet';
import GovernanceLayout from './Layouts/GovernanceLayout';
import ClaimOwnership from './Pages/Governance/ClaimOwnership';
import AcceptStaffInvite from './Pages/Governance/AcceptStaffInvite';
import GovernanceCockpit from './Pages/Governance/GovernanceCockpit';
import CertificationQueue from './Pages/Governance/CertificationQueue';
import EmergencyConsolePage from './Pages/Governance/EmergencyConsolePage';
import GameCatalogPage from './Pages/Governance/GameCatalogPage';
import TreasuryLedgerPage from './Pages/Governance/TreasuryLedgerPage';
import UserRegistryPage from './Pages/Governance/UserRegistryPage';

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
        <Route path="games/new" element={<CreateGame />} />
        <Route path="games/:id" element={<GameConfig />} />
        <Route path="analytics" element={<DeveloperAnalytics />} />
        <Route path="revenue" element={<DeveloperRevenue />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>
      <Route path="/store" element={isAuthenticated ? <StorefrontLayout /> : <Navigate to="/auth" />}>
        <Route index element={<Home />} />
        <Route path="library" element={<Library />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="games/:id" element={<GameDetails />} />
      </Route>
      {/* Platform Governance & Staff Gateway */}
      <Route path="/platform/claim-ownership" element={<ClaimOwnership />} />
      <Route path="/staff/accept-invitation" element={<AcceptStaffInvite />} />

      {/* Sovereign Governance Console Shell */}
      <Route path="/platform/governance" element={isAuthenticated ? <GovernanceLayout /> : <Navigate to="/auth" />}>
        <Route index element={<GovernanceCockpit />} />
        <Route path="emergency" element={<EmergencyConsolePage />} />
        <Route path="catalog" element={<GameCatalogPage />} />
        <Route path="treasury" element={<TreasuryLedgerPage />} />
        <Route path="users" element={<UserRegistryPage />} />
      </Route>

      <Route path="/certification" element={isAuthenticated ? <GovernanceLayout /> : <Navigate to="/auth" />}>
        <Route path="queue" element={<CertificationQueue />} />
      </Route>

      <Route path="/payment" element={isAuthenticated ? <StorefrontLayout /> : <Navigate to="/auth" />}>
        <Route path="success" element={<PaymentSuccess />} />
        <Route path="cancelled" element={<PaymentCancelled />} />
      </Route>
    </Routes>
  );
};

export default App;
