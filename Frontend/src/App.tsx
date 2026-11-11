import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth';
import DeveloperPortal from './Pages/DeveloperPortal';
import GameConfig from './Pages/GameConfig';
import DeveloperLayout from './Layouts/DeveloperLayout';
import DeveloperDashboard from './Pages/DeveloperDashboard';
import DeveloperAnalytics from './Pages/DeveloperAnalytics';
import DeveloperRevenue from './Pages/DeveloperRevenue';
import DeveloperReviews from './Pages/DeveloperReviews';
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
import StoreCampaignsPage from './Pages/Governance/StoreCampaignsPage';
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboardPage from './Pages/Admin/AdminDashboardPage';
import AdminCertificationPage from './Pages/Admin/AdminCertificationPage';
import AdminCatalogPage from './Pages/Admin/AdminCatalogPage';
import AdminUsersPage from './Pages/Admin/AdminUsersPage';
import AdminLogsPage from './Pages/Admin/AdminLogsPage';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return '/auth';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'OWNER') return '/platform/governance';
    if (user?.role === 'DEVELOPER') return '/developer/dashboard';
    return '/store';
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultRedirect()} />} />
      <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to={getDefaultRedirect()} />} />
      <Route path="/dashboard" element={<Navigate to={getDefaultRedirect()} />} />
      <Route path="/developer" element={isAuthenticated ? <DeveloperLayout /> : <Navigate to="/auth" />}>
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="portal" element={<DeveloperPortal />} />
        <Route path="games/new" element={<CreateGame />} />
        <Route path="games/:id" element={<GameConfig />} />
        <Route path="analytics" element={<DeveloperAnalytics />} />
        <Route path="reviews" element={<DeveloperReviews />} />
        <Route path="revenue" element={<DeveloperRevenue />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>
      <Route path="/store" element={isAuthenticated ? <StorefrontLayout /> : <Navigate to="/auth" />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Home />} />
        <Route path="library" element={<Library />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="games/:id" element={<GameDetails />} />
      </Route>
      {/* Platform Governance & Staff Gateway */}
      <Route path="/platform/claim-ownership" element={<ClaimOwnership />} />
      <Route path="/staff/accept-invitation" element={<AcceptStaffInvite />} />

      {/* Sovereign Governance Console Shell (RED // OWNER) */}
      <Route path="/platform/governance" element={isAuthenticated ? <GovernanceLayout /> : <Navigate to="/auth" />}>
        <Route index element={<GovernanceCockpit />} />
        <Route path="emergency" element={<EmergencyConsolePage />} />
        <Route path="catalog" element={<GameCatalogPage />} />
        <Route path="treasury" element={<TreasuryLedgerPage />} />
        <Route path="users" element={<UserRegistryPage />} />
        <Route path="campaigns" element={<StoreCampaignsPage />} />
      </Route>

      {/* Admin Operations Suite (BLUE // ADMIN & OWNER) */}
      <Route path="/admin" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/auth" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="certification" element={<AdminCertificationPage />} />
        <Route path="catalog" element={<AdminCatalogPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
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
