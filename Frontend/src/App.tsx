import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';
import ErrorBoundary from './Components/Common/ErrorBoundary';

// Laser-themed Skeleton Loaders
import StoreSkeletonLoader from './Components/Store/StoreSkeletonLoader';
import DeveloperSkeleton from './Components/Developer/DeveloperSkeleton';
import AdminSkeleton from './Components/Admin/AdminSkeleton';
import GovernanceSkeleton from './Components/Governance/GovernanceSkeleton';
import CyberSkeleton from './Components/Common/CyberSkeleton';

// Auth & Staff (Lazy-loaded)
const Auth = lazy(() => import('./Pages/Auth'));
const ClaimOwnership = lazy(() => import('./Pages/Governance/ClaimOwnership'));
const AcceptStaffInvite = lazy(() => import('./Pages/Governance/AcceptStaffInvite'));

// Storefront Suite (Lazy-loaded)
const StorefrontLayout = lazy(() => import('./Layouts/StorefrontLayout'));
const Home = lazy(() => import('./Pages/Storefront/Home'));
const GameDetails = lazy(() => import('./Pages/Storefront/GameDetails'));
const Library = lazy(() => import('./Pages/Storefront/Library'));
const Profile = lazy(() => import('./Pages/Storefront/Profile'));
const Wallet = lazy(() => import('./Pages/Storefront/Wallet'));
const FriendsPage = lazy(() => import('./Pages/Storefront/FriendsPage'));
const PaymentSuccess = lazy(() => import('./Pages/Storefront/PaymentSuccess'));
const PaymentCancelled = lazy(() => import('./Pages/Storefront/PaymentCancelled'));

// Developer Studio Suite (Lazy-loaded)
const DeveloperLayout = lazy(() => import('./Layouts/DeveloperLayout'));
const DeveloperDashboard = lazy(() => import('./Pages/DeveloperDashboard'));
const DeveloperPortal = lazy(() => import('./Pages/DeveloperPortal'));
const CreateGame = lazy(() => import('./Pages/CreateGame'));
const GameConfig = lazy(() => import('./Pages/GameConfig'));
const DeveloperAnalytics = lazy(() => import('./Pages/DeveloperAnalytics'));
const DeveloperReviews = lazy(() => import('./Pages/DeveloperReviews'));
const DeveloperRevenue = lazy(() => import('./Pages/DeveloperRevenue'));

// Admin Operations Suite (Lazy-loaded)
const AdminLayout = lazy(() => import('./Layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./Pages/Admin/AdminDashboardPage'));
const AdminCertificationPage = lazy(() => import('./Pages/Admin/AdminCertificationPage'));
const AdminCatalogPage = lazy(() => import('./Pages/Admin/AdminCatalogPage'));
const AdminUsersPage = lazy(() => import('./Pages/Admin/AdminUsersPage'));
const AdminLogsPage = lazy(() => import('./Pages/Admin/AdminLogsPage'));

// Platform Sovereign Governance Suite (Lazy-loaded)
const GovernanceLayout = lazy(() => import('./Layouts/GovernanceLayout'));
const GovernanceCockpit = lazy(() => import('./Pages/Governance/GovernanceCockpit'));
const CertificationQueue = lazy(() => import('./Pages/Governance/CertificationQueue'));
const EmergencyConsolePage = lazy(() => import('./Pages/Governance/EmergencyConsolePage'));
const GameCatalogPage = lazy(() => import('./Pages/Governance/GameCatalogPage'));
const TreasuryLedgerPage = lazy(() => import('./Pages/Governance/TreasuryLedgerPage'));
const UserRegistryPage = lazy(() => import('./Pages/Governance/UserRegistryPage'));
const StoreCampaignsPage = lazy(() => import('./Pages/Governance/StoreCampaignsPage'));
const TelemetryPage = lazy(() => import('./Pages/Governance/TelemetryPage'));

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
    <ErrorBoundary fallbackTitle="GameStation Shell Interrupted">
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRedirect()} />} />

        {/* ── AUTHENTICATION ────────────────────────────────────────────── */}
        <Route
          path="/auth"
          element={
            <Suspense fallback={<CyberSkeleton role="CITIZEN" layout="dashboard" />}>
              {!isAuthenticated ? <Auth /> : <Navigate to={getDefaultRedirect()} />}
            </Suspense>
          }
        />

        <Route path="/dashboard" element={<Navigate to={getDefaultRedirect()} />} />

        {/* ── DEVELOPER STUDIO SUITE (VIOLET // DEVELOPER) ────────────────── */}
        <Route
          path="/developer"
          element={
            isAuthenticated ? (
              <Suspense fallback={<DeveloperSkeleton />}>
                <DeveloperLayout />
              </Suspense>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route path="dashboard" element={<DeveloperDashboard />} />
          <Route path="portal" element={<DeveloperPortal />} />
          <Route path="games/new" element={<CreateGame />} />
          <Route path="games/:id" element={<GameConfig />} />
          <Route path="analytics" element={<DeveloperAnalytics />} />
          <Route path="reviews" element={<DeveloperReviews />} />
          <Route path="revenue" element={<DeveloperRevenue />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* ── STOREFRONT SUITE (EMERALD // PLAYER) ───────────────────────── */}
        <Route
          path="/store"
          element={
            isAuthenticated ? (
              <Suspense fallback={<StoreSkeletonLoader />}>
                <StorefrontLayout />
              </Suspense>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route index element={<Home />} />
          <Route path="browse" element={<Navigate to="/store" replace />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="games/:id" element={<GameDetails />} />
        </Route>

        {/* ── PLATFORM GOVERNANCE & STAFF GATEWAY ───────────────────────── */}
        <Route
          path="/platform/claim-ownership"
          element={
            <Suspense fallback={<CyberSkeleton role="OWNER" layout="dashboard" />}>
              <ClaimOwnership />
            </Suspense>
          }
        />
        <Route
          path="/staff/accept-invitation"
          element={
            <Suspense fallback={<CyberSkeleton role="ADMIN" layout="dashboard" />}>
              <AcceptStaffInvite />
            </Suspense>
          }
        />

        {/* ── SOVEREIGN GOVERNANCE CONSOLE SHELL (CRIMSON // OWNER) ──────── */}
        <Route
          path="/platform/governance"
          element={
            isAuthenticated ? (
              <Suspense fallback={<GovernanceSkeleton />}>
                <GovernanceLayout />
              </Suspense>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route index element={<GovernanceCockpit />} />
          <Route path="telemetry" element={<TelemetryPage />} />
          <Route path="emergency" element={<EmergencyConsolePage />} />
          <Route path="catalog" element={<GameCatalogPage />} />
          <Route path="treasury" element={<TreasuryLedgerPage />} />
          <Route path="users" element={<UserRegistryPage />} />
          <Route path="campaigns" element={<StoreCampaignsPage />} />
        </Route>

        {/* ── ADMIN OPERATIONS SUITE (CYAN // ADMIN & OWNER) ─────────────── */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <Suspense fallback={<AdminSkeleton />}>
                <AdminLayout />
              </Suspense>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="certification" element={<AdminCertificationPage />} />
          <Route path="catalog" element={<AdminCatalogPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
        </Route>

        <Route
          path="/certification"
          element={
            isAuthenticated ? (
              <Suspense fallback={<GovernanceSkeleton />}>
                <GovernanceLayout />
              </Suspense>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route path="queue" element={<CertificationQueue />} />
        </Route>

        <Route
          path="/payment"
          element={
            isAuthenticated ? (
              <Suspense fallback={<StoreSkeletonLoader />}>
                <StorefrontLayout />
              </Suspense>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route path="success" element={<PaymentSuccess />} />
          <Route path="cancelled" element={<PaymentCancelled />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
