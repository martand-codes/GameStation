import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Shield, Key, CreditCard, HardDrive, Clock, 
  Check, Copy, ExternalLink, RefreshCw, AlertCircle, 
  CheckCircle2, Laptop, Smartphone, Lock, UserCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { 
  getProfileAPI, 
  updateProfileAPI, 
  changePasswordAPI, 
  revokeOtherSessionsAPI, 
  type UserProfile 
} from '../../Services/Profile.service';

export default function Profile() {
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'purchases'>('settings');

  // Edit Profile Form
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Session & UI feedback
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [copiedStripeId, setCopiedStripeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playtime tracked locally from game launcher
  const totalPlaytimeHours = useMemo(() => {
    try {
      const saved = localStorage.getItem('gamestation_playtimes');
      if (!saved) return '0.0';
      const parsed = JSON.parse(saved);
      const totalSecs = Object.values(parsed).reduce((a: any, b: any) => Number(a) + Number(b), 0);
      return (Number(totalSecs) / 3600).toFixed(1);
    } catch {
      return '0.0';
    }
  }, []);

  // System Hardware Detection Deep-Dive
  const hardwareRig = useMemo(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    let renderer = 'WebGL 2.0 (Standard Acceleration)';
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
      }
    }

    return {
      os: navigator.userAgent.includes('Windows') ? 'Windows NT 10.0 (x64)' : navigator.platform || 'Unix/Linux',
      browser: navigator.userAgent.includes('Chrome') ? 'Chromium Engine' : 'Gecko Runtime',
      resolution: `${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio}x DPI`,
      gpu: renderer,
      cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Threads` : '8 Cores',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProfileAPI();
      if (res.success) {
        setProfile(res.data);
        setUsernameInput(res.data.username);
        setEmailInput(res.data.email);
      } else {
        setError('Failed to fetch profile data.');
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Failed to connect to profile server.');
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Update Profile (Username & Email)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    try {
      setSavingProfile(true);
      const res = await updateProfileAPI({
        username: usernameInput.trim(),
        email: emailInput.trim(),
      });

      if (res.success) {
        setProfile((prev) => prev ? { ...prev, username: res.user.username, email: res.user.email } : null);
        showToast('Profile information updated successfully');

        // Sync local auth state
        const token = localStorage.getItem('accessToken') || '';
        const refresh = localStorage.getItem('refreshToken') || '';
        login({
          id: res.user.id,
          username: res.user.username,
          email: res.user.email,
          role: res.user.role
        }, token, refresh);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please provide both current and new passwords.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await changePasswordAPI({ currentPassword, newPassword });
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password changed successfully');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // 3. Switch Account Role (Player <-> Developer)
  const handleRoleToggle = async () => {
    if (!profile) return;
    const targetRole = profile.role === 'DEVELOPER' ? 'PLAYER' : 'DEVELOPER';

    try {
      const res = await updateProfileAPI({ role: targetRole });
      if (res.success) {
        setProfile((prev) => prev ? { ...prev, role: res.user.role } : null);
        showToast(`Account clearance updated to ${targetRole}`);
        const token = localStorage.getItem('accessToken') || '';
        const refresh = localStorage.getItem('refreshToken') || '';
        login({
          id: res.user.id,
          username: res.user.username,
          email: res.user.email,
          role: res.user.role
        }, token, refresh);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change account clearance');
    }
  };

  // 4. Revoke Other Sessions
  const handleRevokeOtherSessions = async () => {
    try {
      setRevokingSessions(true);
      const res = await revokeOtherSessionsAPI();
      if (res.success) {
        showToast('All other device sessions have been disconnected');
        fetchProfile();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to revoke other sessions');
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleCopyStripe = (stripeId: string) => {
    navigator.clipboard.writeText(stripeId);
    setCopiedStripeId(stripeId);
    showToast(`Payment ID copied to clipboard`);
    setTimeout(() => setCopiedStripeId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] font-mono text-emerald-500">
        <Terminal className="h-10 w-10 mb-4 animate-pulse text-emerald-400" />
        <div className="w-full max-w-md bg-[#0D1117] p-5 rounded-md border border-[#30363D] shadow-2xl">
          <p className="text-xs text-[#8B949E] mb-2">&gt; Loading user profile and account configuration...</p>
          <p className="text-xs text-emerald-400">&gt; Authenticating session for @{authUser?.username || 'user'}</p>
          <p className="text-xs mt-2 animate-pulse text-emerald-400">_</p>
        </div>
      </div>
    );
  }

  // Active Sessions Classification
  const desktopSession = profile?.sessions?.find(s => s.deviceType === 'DESKTOP');
  const mobileSession = profile?.sessions?.find(s => s.deviceType === 'MOBILE');

  return (
    <div className="space-y-8 font-mono pb-20 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E1520] border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-md shadow-[0_0_25px_rgba(16,185,129,0.3)] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-300 px-4 py-3 rounded-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchProfile} className="underline text-red-400 hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Top Profile Header */}
      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar and Identity */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#161B22] border border-emerald-500/40 flex items-center justify-center overflow-hidden">
                <Terminal className="w-8 h-8 text-emerald-400" />
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" 
                title="Active Session"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  @{profile?.username || 'user'}
                </h1>
                
                {/* Role Badge */}
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  profile?.role === 'DEVELOPER' 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                    : profile?.role === 'ADMIN'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {profile?.role || 'PLAYER'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B949E] mt-1.5">
                <span>{profile?.email}</span>
                <span className="text-[#30363D]">•</span>
                <span>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '2026'}</span>
              </div>
            </div>
          </div>

          {/* Developer Portal Shortcut */}
          {profile?.role === 'DEVELOPER' && (
            <div>
              <button
                onClick={() => navigate('/developer/dashboard')}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded text-xs font-bold transition-all flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" /> Developer Portal <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* 3 Real Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#21262D] text-xs">
          
          <div 
            onClick={() => navigate('/store/library')}
            className="bg-[#161B22] hover:bg-[#1C212B] border border-[#30363D] hover:border-emerald-500/40 p-4 rounded cursor-pointer transition-all group"
          >
            <span className="text-[11px] text-[#8B949E] uppercase flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
              <HardDrive className="w-3.5 h-3.5" /> Games in Vault
            </span>
            <p className="text-xl font-bold text-white mt-1 flex items-center justify-between">
              <span>{profile?._count.library || 0} Games</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
            </p>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] p-4 rounded">
            <span className="text-[11px] text-[#8B949E] uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Playtime Recorded
            </span>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {totalPlaytimeHours} hrs
            </p>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] p-4 rounded">
            <span className="text-[11px] text-[#8B949E] uppercase flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Total Purchases
            </span>
            <p className="text-xl font-bold text-white mt-1">
              INR ₹{profile?.totalSpent ? Number(profile.totalSpent).toFixed(2) : '0.00'}
            </p>
          </div>

        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#21262D] pb-1 text-xs">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-md font-bold transition-all border-b-2 ${
            activeTab === 'settings'
              ? 'text-emerald-400 border-emerald-500 bg-[#0D1117]'
              : 'text-[#8B949E] border-transparent hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Account & Settings
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-md font-bold transition-all border-b-2 ${
            activeTab === 'purchases'
              ? 'text-cyan-400 border-cyan-500 bg-[#0D1117]'
              : 'text-[#8B949E] border-transparent hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Purchase History
          {profile?.payments && profile.payments.length > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px]">
              {profile.payments.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACCOUNT & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          
          {/* Section: Profile & Security Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Account Details Form */}
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Profile Information
              </h3>
              <p className="text-xs text-[#8B949E]">
                Update your display username and primary contact email for receipts.
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="text-[#8B949E] uppercase block mb-1 text-[11px]">Username</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] focus:border-emerald-500 rounded px-3 py-2 text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#8B949E] uppercase block mb-1 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] focus:border-emerald-500 rounded px-3 py-2 text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Change Password Form */}
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Change Password
              </h3>
              <p className="text-xs text-[#8B949E]">
                Manage your credentials with bcrypt encryption.
              </p>

              {passwordError && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/40 text-red-300 rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8B949E] uppercase block mb-1 text-[11px]">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] focus:border-emerald-500 rounded px-3 py-2 text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8B949E] uppercase block mb-1 text-[11px]">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#161B22] border border-[#30363D] focus:border-emerald-500 rounded px-3 py-2 text-white outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[#8B949E] uppercase block mb-1 text-[11px]">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#161B22] border border-[#30363D] focus:border-emerald-500 rounded px-3 py-2 text-white outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-4 py-2 bg-[#21262D] hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 rounded font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Section: Account Clearance Role Switch */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" /> Account Clearance Role
              </h3>
              <p className="text-xs text-[#8B949E] mt-1">
                Current Role: <span className="text-white font-bold">{profile?.role}</span>. Switching to Developer mode unlocks game submissions, pricing, and analytics.
              </p>
            </div>

            <button
              onClick={handleRoleToggle}
              className="px-4 py-2 bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] hover:text-white border border-[#30363D] hover:border-purple-500/50 rounded text-xs font-bold transition-all whitespace-nowrap"
            >
              Switch to {profile?.role === 'DEVELOPER' ? 'Player Role' : 'Developer Clearance'}
            </button>
          </div>

          {/* Section: System Hardware Diagnostics Deep-Dive */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400" /> System Hardware Diagnostics
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Real client hardware detected via browser WebGL and system runtime. Used to verify minimum and recommended requirements for games in the store.
                </p>
              </div>

              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                DIAGNOSTICS_ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-2">
              <div className="bg-[#161B22] border border-[#21262D] p-3.5 rounded">
                <span className="text-[10px] text-[#556772] uppercase block">Operating System</span>
                <span className="text-white font-bold">{hardwareRig.os}</span>
              </div>

              <div className="bg-[#161B22] border border-[#21262D] p-3.5 rounded">
                <span className="text-[10px] text-[#556772] uppercase block">CPU Processing Units</span>
                <span className="text-white font-bold">{hardwareRig.cores}</span>
              </div>

              <div className="bg-[#161B22] border border-[#21262D] p-3.5 rounded">
                <span className="text-[10px] text-[#556772] uppercase block">Display Resolution & Scaling</span>
                <span className="text-white font-bold">{hardwareRig.resolution}</span>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 bg-[#161B22] border border-[#21262D] p-3.5 rounded">
                <span className="text-[10px] text-[#556772] uppercase block">Dedicated Graphics Acceleration (GPU)</span>
                <span className="text-emerald-400 font-bold break-all">{hardwareRig.gpu}</span>
              </div>
            </div>
          </div>

          {/* Section: 1 Desktop + 1 Mobile Device Session Management */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" /> Active Devices & Session Policy
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Policy: <span className="text-emerald-400 font-bold">1 Desktop PC + 1 Mobile Device</span>. Logging into another computer will automatically disconnect this PC session to prevent simultaneous account sharing.
                </p>
              </div>

              <button
                onClick={handleRevokeOtherSessions}
                disabled={revokingSessions}
                className="px-3 py-1.5 bg-[#161B22] hover:bg-red-500/20 text-[#8B949E] hover:text-red-400 border border-[#30363D] hover:border-red-500/40 rounded text-xs transition-colors whitespace-nowrap"
              >
                {revokingSessions ? 'Revoking...' : 'Sign Out Other Devices'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              
              {/* Desktop Device */}
              <div className="bg-[#161B22] border border-emerald-500/40 p-4 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {desktopSession?.deviceName || 'Windows PC'}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active (This Computer)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold uppercase">
                  DESKTOP
                </span>
              </div>

              {/* Mobile Device */}
              <div className={`p-4 rounded flex items-center justify-between border ${
                mobileSession ? 'bg-[#161B22] border-blue-500/40' : 'bg-[#12161E] border-[#21262D]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${mobileSession ? 'bg-blue-500/10 text-blue-400' : 'bg-[#161B22] text-[#556772]'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-bold block ${mobileSession ? 'text-white' : 'text-[#8B949E]'}`}>
                      {mobileSession?.deviceName || 'Mobile Phone'}
                    </span>
                    <span className="text-[10px] text-[#556772]">
                      {mobileSession ? `Connected on ${new Date(mobileSession.createdAt).toLocaleDateString()}` : 'No mobile device logged in'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-[#161B22] text-[#8B949E] border border-[#30363D] rounded font-bold uppercase">
                  MOBILE
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PURCHASE HISTORY */}
      {activeTab === 'purchases' && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Stripe Purchase Ledger
              </h3>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Verified digital licenses and order receipts processed through Stripe.
              </p>
            </div>

            <button
              onClick={fetchProfile}
              className="p-2 bg-[#161B22] border border-[#30363D] hover:border-cyan-500/40 text-[#8B949E] hover:text-cyan-300 rounded transition-colors"
              title="Refresh Transactions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {!profile?.payments || profile.payments.length === 0 ? (
            <div className="text-center py-12 text-[#8B949E]">
              <CreditCard className="w-10 h-10 mx-auto mb-3 text-[#556772]" />
              <p className="text-sm font-bold text-white">No Purchase Transactions Found</p>
              <p className="text-xs text-[#556772] mt-1">
                You haven't completed any purchases yet. Explore the storefront to discover indie titles.
              </p>
              <button
                onClick={() => navigate('/store')}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all"
              >
                Browse Storefront
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#30363D] bg-[#161B22] text-[#556772] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Item & Edition</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 hidden md:table-cell">Status</th>
                    <th className="py-3 px-4">Stripe Reference</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262D]">
                  {profile.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#161B22]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.game?.media?.coverImageUrl ? (
                            <img
                              src={p.game.media.coverImageUrl}
                              alt={p.game.title}
                              className="w-8 h-10 object-cover rounded bg-[#05070A] border border-[#30363D]"
                            />
                          ) : (
                            <div className="w-8 h-10 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-[#556772]" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white block">
                              {p.game?.title || 'GameStation License'}
                            </span>
                            <span className="text-[10px] text-cyan-400">
                              {p.pricing?.editionName || 'Standard Edition'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        {p.currency} {Number(p.amount).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded font-bold uppercase">
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#8B949E]">
                        {p.providerPaymentId ? (
                          <button
                            onClick={() => handleCopyStripe(p.providerPaymentId!)}
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                            title={p.providerPaymentId}
                          >
                            <span>{p.providerPaymentId.slice(0, 14)}...</span>
                            {copiedStripeId === p.providerPaymentId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[#556772]">INTERNAL_CLAIM</span>
                        )}
                      </td>

                      <td className="py-3 px-4 hidden sm:table-cell text-[#8B949E]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {p.game?.id && (
                          <button
                            onClick={() => navigate(`/store/games/${p.game!.id}`)}
                            className="p-1.5 bg-[#161B22] hover:bg-cyan-600/20 text-[#8B949E] hover:text-cyan-300 border border-[#30363D] rounded transition-colors inline-flex items-center"
                            title="Inspect Game Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
