import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { verifyStaffInviteAPI, acceptStaffInviteAPI } from '../../Services/Governance.service';
import { ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';

export default function AcceptStaffInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg('No invitation token was provided in the link.');
      return;
    }
    verifyToken(token);
  }, [token]);

  const verifyToken = async (inviteToken: string) => {
    try {
      setLoading(true);
      const res = await verifyStaffInviteAPI(inviteToken);
      setTokenValid(true);
      setInviteData(res);
    } catch (err: any) {
      setTokenValid(false);
      setErrorMsg(err.response?.data?.message || 'Invalid, expired, or already claimed staff invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (username.trim().length < 3) {
      return setFormError('Staff username must be at least 3 characters.');
    }
    if (!email.includes('@')) {
      return setFormError('Valid email address is required.');
    }
    if (password.length < 8) {
      return setFormError('Password must be at least 8 characters.');
    }

    try {
      setSubmitting(true);
      const res = await acceptStaffInviteAPI({
        token: token!,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      login(res.user, res.accessToken, res.refreshToken);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to claim staff invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-emerald-400">
          <span className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#9B9B9B]">Verifying invitation token...</span>
        </div>
      </main>
    );
  }

  // Token is invalid or expired
  if (!tokenValid) {
    return (
      <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#181818] border border-[#272727] rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] border border-[#272727] flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Invalid invitation token
            </h1>
            <p className="text-sm text-[#9B9B9B] bg-[#1F1F1F] border border-[#272727] p-3 rounded-xl font-mono text-xs">
              {errorMsg}
            </p>
          </div>

          <p className="text-xs text-[#666666] [text-wrap:pretty]">
            Staff onboarding tokens are single use and time limited. If this token was revoked or expired, request a fresh invitation link from the platform owner.
          </p>

          <button
            onClick={() => navigate('/store')}
            className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#272727] text-white font-semibold rounded-lg text-sm border border-[#272727] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
          >
            Return to store
          </button>
        </div>
      </main>
    );
  }

  // Valid Token: Registration Form
  return (
    <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center p-6 selection:bg-emerald-500/20 font-sans">
      <div className="max-w-md w-full bg-[#181818] border border-[#272727] rounded-2xl p-8 shadow-2xl space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff onboarding</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight [text-wrap:balance]">
            Accept staff clearance
          </h1>
          <p className="text-sm text-[#9B9B9B] [text-wrap:pretty]">
            You have been invited by <strong className="text-white">@{inviteData?.invitedBy || 'Owner'}</strong> to join the GameStation Certification Board as an <span className="text-emerald-400 font-mono text-xs">[{inviteData?.role || 'ADMIN'}]</span>.
          </p>
        </div>

        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9B9B9B] mb-2">
              Staff username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. marcus_reviewer"
              className="w-full bg-[#1F1F1F] border border-[#272727] focus:border-[#313131] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9B9B9B] mb-2">
              Staff email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marcus@staff.gamestation.com"
              className="w-full bg-[#1F1F1F] border border-[#272727] focus:border-[#313131] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9B9B9B] mb-2">
              Account password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-[#1F1F1F] border border-[#272727] focus:border-[#313131] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-3 bg-white hover:bg-[#EDEDED] text-black font-semibold text-sm rounded-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Authenticating clearance...'
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-black" />
                  <span>Accept clearance and enter desk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
