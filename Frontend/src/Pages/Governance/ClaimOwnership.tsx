import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { getGovernanceStatusAPI, claimRootOwnershipAPI } from '../../Services/Governance.service';
import { 
  ShieldAlert, 
  Crown, 
  Key, 
  Lock, 
  Copy, 
  Download, 
  Check, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';

export default function ClaimOwnership() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [hasOwner, setHasOwner] = useState(false);
  const [existingOwner, setExistingOwner] = useState<any>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Post-Claim Recovery State
  const [claimedData, setClaimedData] = useState<{
    user: any;
    accessToken: string;
    refreshToken: string;
    recoveryPhrase: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmedBackup, setConfirmedBackup] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const data = await getGovernanceStatusAPI();
      setHasOwner(data.hasOwner);
      setExistingOwner(data.owner);
    } catch (err: any) {
      console.error("Failed to query governance status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (username.trim().length < 3) {
      return setErrorMsg('Founder username must be at least 3 characters.');
    }
    if (!email.includes('@')) {
      return setErrorMsg('A valid corporate email is required.');
    }
    if (password.length < 8) {
      return setErrorMsg('Master password must be at least 8 characters.');
    }

    try {
      setSubmitting(true);
      const res = await claimRootOwnershipAPI({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setClaimedData({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        recoveryPhrase: res.recoveryPhrase,
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Genesis claim failed. Authority may have already been established.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPhraseToClipboard = () => {
    if (!claimedData) return;
    navigator.clipboard.writeText(claimedData.recoveryPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRecoveryFile = () => {
    if (!claimedData) return;
    const content = `=====================================================
GAMESTATION ROOT AUTHORITY EMERGENCY RECOVERY CARD
=====================================================

Platform Owner: @${claimedData.user.username}
Corporate Email: ${claimedData.user.email}
Genesis Timestamp: ${new Date().toISOString()}

12-WORD DISASTER RECOVERY PHRASE:
${claimedData.recoveryPhrase}

EMERGENCY BREAK-GLASS PROCEDURE:
If the Owner account or platform web sessions are ever compromised:
1. Access the server host terminal.
2. Run: npm run root:recover -- --username=${claimedData.user.username} --new-password=<NEW_PASS> --phrase="${claimedData.recoveryPhrase}"
3. The platform will instantly nuke all active web sessions worldwide, void all pending invite tokens, and restore clean Owner authority.

KEEP THIS DOCUMENT SECURE AND AIR-GAPPED.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gamestation-root-recovery-${claimedData.user.username}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const proceedToGovernance = () => {
    if (!claimedData) return;
    login(claimedData.user, claimedData.accessToken, claimedData.refreshToken);
    navigate('/platform/governance');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-emerald-400">
          <span className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#9B9B9B]">Probing genesis state...</span>
        </div>
      </main>
    );
  }

  // State 1: Platform already has an owner - Route permanently sealed
  if (hasOwner && !claimedData) {
    return (
      <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#181818] border border-[#272727] rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] border border-[#272727] flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Genesis route sealed
            </h1>
            <p className="text-sm text-[#9B9B9B] [text-wrap:pretty]">
              Platform root authority has already been established for this instance. The genesis ceremony is a single event protocol and cannot be re-executed.
            </p>
          </div>

          {existingOwner && (
            <div className="bg-[#1F1F1F] border border-[#272727] rounded-xl p-4 text-left space-y-1">
              <span className="text-xs text-[#9B9B9B] font-medium block">
                Active platform founder
              </span>
              <div className="text-sm font-semibold text-white">@{existingOwner.username}</div>
              <div className="text-xs text-[#9B9B9B] font-mono">{existingOwner.email}</div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-2 px-3 bg-white hover:bg-[#EDEDED] text-black font-semibold rounded-lg text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
            >
              Sign in to existing account
            </button>
            <button
              onClick={() => navigate('/store')}
              className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#272727] text-[#9B9B9B] hover:text-white font-semibold rounded-lg text-sm border border-[#272727] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
            >
              Return to store
            </button>
          </div>
        </div>
      </main>
    );
  }

  // State 2: Root Claimed - Display 12-Word Recovery Vault Card
  if (claimedData) {
    const words = claimedData.recoveryPhrase.split(' ');

    return (
      <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center p-6 selection:bg-emerald-500/20 font-sans">
        <div className="max-w-xl w-full bg-[#181818] border border-[#272727] rounded-2xl p-8 shadow-2xl space-y-6">
          
          <div className="flex items-center gap-3 border-b border-[#272727] pb-6">
            <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] border border-[#272727] flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Root authority claimed
              </h1>
              <p className="text-sm text-[#9B9B9B]">
                You are now the certified platform owner of GameStation.
              </p>
            </div>
          </div>

          <div className="bg-[#1F1F1F] border border-[#272727] rounded-xl p-4 text-xs text-[#9B9B9B] space-y-1">
            <strong className="text-white block font-medium">Emergency recovery vault key</strong>
            <p className="leading-relaxed">
              Below is your 12 word seed phrase. This will not be displayed again. If owner credentials are compromised, this phrase executes the offline recovery protocol.
            </p>
          </div>

          {/* 12-Word Grid */}
          <div className="bg-[#1F1F1F] border border-[#272727] rounded-xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {words.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-[#181818] border border-[#272727] rounded-lg p-2.5 flex items-center gap-2"
                >
                  <span className="text-xs text-[#666666] font-mono w-4">{idx + 1}.</span>
                  <span className="text-sm font-medium text-white font-mono">{word}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={copyPhraseToClipboard}
              className="flex-1 py-2 px-3 bg-[#1F1F1F] hover:bg-[#272727] text-white rounded-lg text-sm font-semibold border border-[#272727] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#9B9B9B]" />}
              <span>{copied ? "Copied" : "Copy words"}</span>
            </button>
            <button
              onClick={downloadRecoveryFile}
              className="flex-1 py-2 px-3 bg-[#1F1F1F] hover:bg-[#272727] text-white rounded-lg text-sm font-semibold border border-[#272727] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-[#9B9B9B]" />
              <span>Download key (.txt)</span>
            </button>
          </div>

          {/* Backup confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer bg-[#1F1F1F] p-4 rounded-xl border border-[#272727]">
            <input
              type="checkbox"
              checked={confirmedBackup}
              onChange={(e) => setConfirmedBackup(e.target.checked)}
              className="mt-0.5 accent-white w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs text-[#9B9B9B] leading-relaxed select-none">
              I have saved and backed up my 12 word recovery phrase offline. I acknowledge that GameStation cannot recover this phrase if lost.
            </span>
          </label>

          {/* Proceed Button */}
          <button
            onClick={proceedToGovernance}
            disabled={!confirmedBackup}
            className={`w-full py-2.5 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              confirmedBackup
                ? 'bg-white hover:bg-[#EDEDED] text-black active:scale-[0.98] cursor-pointer'
                : 'bg-[#1F1F1F] text-[#666666] border border-[#272727] cursor-not-allowed'
            }`}
          >
            <span>Enter platform governance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    );
  }

  // State 3: Genesis Ceremony Form (No Owner exists)
  return (
    <main className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center p-6 selection:bg-emerald-500/20 font-sans">
      <div className="max-w-md w-full bg-[#181818] border border-[#272727] rounded-2xl p-8 shadow-2xl space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <span>Genesis ceremony</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight [text-wrap:balance]">
            Claim root ownership
          </h1>
          <p className="text-sm text-[#9B9B9B] [text-wrap:pretty]">
            Initialize the primary executive authority for this platform. Once completed, this route seals permanently.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9B9B9B] mb-2">
              Founder username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. martand"
              className="w-full bg-[#1F1F1F] border border-[#272727] focus:border-[#313131] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9B9B9B] mb-2">
              Corporate email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@gamestation.com"
              className="w-full bg-[#1F1F1F] border border-[#272727] focus:border-[#313131] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9B9B9B] mb-2">
              Master password
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

          <div className="bg-[#1F1F1F] border border-[#272727] rounded-xl p-3 text-xs text-[#9B9B9B] flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 text-[#9B9B9B] mt-0.5" />
            <span>
              Claiming root authority grants governance privileges over marketplace revenue, certification reviewers, and store operations.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-3 bg-white hover:bg-[#EDEDED] text-black font-semibold text-sm rounded-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Initializing root authority...' : 'Claim platform ownership'}
          </button>
        </form>
      </div>
    </main>
  );
}
