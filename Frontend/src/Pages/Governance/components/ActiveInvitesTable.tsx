import { motion } from 'framer-motion';
import { Key, Plus, ShieldAlert } from 'lucide-react';

interface StaffInvite {
  id: string;
  token: string;
  role: string;
  isUsed: boolean;
  usedByEmail?: string;
  expiresAt: string;
}

interface ActiveInvitesTableProps {
  invites: StaffInvite[];
  onOpenInviteModal: () => void;
  onRevokeInvite: (inviteId: string) => void;
}

export default function ActiveInvitesTable({
  invites,
  onOpenInviteModal,
  onRevokeInvite,
}: ActiveInvitesTableProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: '#0d0d12',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 36px -4px rgba(0, 0, 0, 0.65)',
      }}
    >
      <div className="p-6 sm:p-7 border-b border-white/[0.06] flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Staff Recruitment Tokens
            </h2>
            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded-full uppercase">
              {invites.length} Issued
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Single-use cryptographic onboarding tokens issued by Chief Sovereign
          </p>
        </div>
        <button
          onClick={onOpenInviteModal}
          className="flex items-center gap-1.5 py-2.5 px-4 bg-[#FF1E27] hover:bg-[#E0151E] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_0_16px_rgba(255,30,39,0.35)] shrink-0 font-mono"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Mint Token</span>
        </button>
      </div>

      {invites.length === 0 ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#14141c] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
            <Key className="w-5 h-5 text-[#FF1E27]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">No active invitation tokens</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
              Mint an onboarding token to grant reviewer clearance to a new operator.
            </p>
          </div>
          <button
            onClick={onOpenInviteModal}
            className="py-2 px-4 bg-[#FF1E27] hover:bg-[#E0151E] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_0_16px_rgba(255,30,39,0.3)] font-mono"
          >
            Issue Staff Invite
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#121218] text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-6">Token Signature</th>
                <th className="py-4 px-6">Clearance Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Expires At</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {invites.map((inv) => {
                const isExpired = new Date() > new Date(inv.expiresAt);
                const isClaimed = inv.isUsed;

                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-[#FF1E27] font-semibold">
                      {inv.token.substring(0, 16)}...
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-300 font-mono text-xs">
                      {inv.role}
                    </td>
                    <td className="py-4 px-6">
                      {isClaimed ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                          CLAIMED ({inv.usedByEmail || 'ACCEPTED'})
                        </span>
                      ) : isExpired ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-red-950/40 text-red-400 border border-red-500/30">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                          PENDING CLAIM
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-zinc-400 font-mono">
                      {new Date(inv.expiresAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isClaimed && !isExpired && (
                        <button
                          onClick={() => onRevokeInvite(inv.id)}
                          className="py-1.5 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/25 transition-all cursor-pointer active:scale-95 font-mono"
                        >
                          Revoke Token
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
