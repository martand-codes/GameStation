import { motion } from 'framer-motion';
import { UserCheck, Shield } from 'lucide-react';

interface StaffMember {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    reviewedGames: number;
  };
}

interface StaffRosterTableProps {
  staff: StaffMember[];
  currentUserId?: string;
  onRevokeStaff: (staffId: string, username: string) => void;
}

export default function StaffRosterTable({ staff, currentUserId, onRevokeStaff }: StaffRosterTableProps) {
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
      {/* Table Header / Title */}
      <div className="p-6 sm:p-7 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Appointed Certification Staff
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#FF1E27] bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">
              {staff.length} Commissioned
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Operators authorized to evaluate, certify, approve, and reject developer game submissions
          </p>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#121218] text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-white/[0.06]">
            <tr>
              <th className="py-4 px-6">Operator Member</th>
              <th className="py-4 px-6">Clearance Role</th>
              <th className="py-4 px-6">Certified Titles</th>
              <th className="py-4 px-6">Commissioned Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {staff.map((s) => {
              const isSelf = s.id === currentUserId;
              const isOwner = s.role === 'OWNER';

              return (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">@{s.username}</span>
                      {isSelf && (
                        <span className="text-[10px] font-mono font-bold text-[#FF1E27] bg-red-950/50 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">
                          You (Root)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">{s.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
                        isOwner
                          ? 'bg-red-500/15 text-[#FF1E27] border-red-500/30'
                          : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60'
                      }`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-zinc-300">
                    {s._count?.reviewedGames || 0} reviews
                  </td>
                  <td className="py-4 px-6 text-xs text-zinc-400 font-mono">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!isSelf && !isOwner ? (
                      <button
                        onClick={() => onRevokeStaff(s.id, s.username)}
                        className="py-1.5 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/25 transition-all cursor-pointer active:scale-95"
                      >
                        Revoke Clearance
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500 font-mono font-medium">
                        [ ROOT IMMUNE ]
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {staff.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-zinc-500 font-mono">
                  No certification operators currently commissioned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
