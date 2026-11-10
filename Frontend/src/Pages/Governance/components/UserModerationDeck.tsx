import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Shield, RefreshCw, Wallet } from 'lucide-react';
import {
  getPlatformUsersAPI,
  toggleUserSuspensionAPI,
  changeUserRoleAPI,
} from '../../../Services/Governance.service';

export default function UserModerationDeck() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query?: string) => {
    try {
      setLoading(true);
      const data = await getPlatformUsersAPI(query);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggleSuspension = async (userId: string, username: string, currentActive: boolean) => {
    const actionLabel = currentActive ? 'SUSPEND' : 'RESTORE';
    const reason = prompt(
      `EXECUTIVE DIRECTIVE:\n${actionLabel} account clearance for @${username}?\nEnter administrative rationale:`
    );
    if (reason === null) return;

    try {
      await toggleUserSuspensionAPI(userId, reason.trim() || undefined);
      await fetchUsers(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async (userId: string, username: string, currentRole: string) => {
    if (currentRole === 'OWNER') {
      alert('The root sovereign clearance role cannot be modified.');
      return;
    }

    const newRole = prompt(
      `REASSIGN ROLE for @${username}:\nEnter new clearance role (PLAYER, DEVELOPER, or ADMIN):`,
      currentRole
    );
    if (!newRole) return;

    const formattedRole = newRole.trim().toUpperCase() as 'PLAYER' | 'DEVELOPER' | 'ADMIN';
    if (!['PLAYER', 'DEVELOPER', 'ADMIN'].includes(formattedRole)) {
      alert('Invalid role specified. Must be PLAYER, DEVELOPER, or ADMIN.');
      return;
    }

    try {
      await changeUserRoleAPI(userId, formattedRole);
      await fetchUsers(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reassign role');
    }
  };

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
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Platform Identity &amp; Ban Hammer Console
            </h2>
            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-800/80 px-2.5 py-0.5 rounded-full uppercase">
              {users.length} Citizens
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Direct sovereign authority over player accounts, developer clearance, suspensions, and role promotions
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or email..."
              className="bg-[#14141c] border border-white/[0.08] focus:border-[#FF1E27] rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none font-mono w-60 sm:w-72"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold uppercase text-white transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#121218] text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-white/[0.06]">
            <tr>
              <th className="py-4 px-6">User Account</th>
              <th className="py-4 px-6">Role Clearance</th>
              <th className="py-4 px-6">Account Status</th>
              <th className="py-4 px-6">Wallet Balance</th>
              <th className="py-4 px-6">Activity Footprint</th>
              <th className="py-4 px-6 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {users.map((u) => {
              const isOwner = u.role === 'OWNER';

              return (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                  <td className="py-4 px-6">
                    <span className="font-bold text-white block">@{u.username}</span>
                    <span className="text-[10px] text-zinc-500 block truncate">{u.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleChangeRole(u.id, u.username, u.role)}
                      disabled={isOwner}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase transition-colors ${
                        isOwner
                          ? 'bg-red-500/15 text-[#FF1E27] border-red-500/30 cursor-default'
                          : u.role === 'ADMIN'
                          ? 'bg-purple-950/40 text-purple-400 border-purple-500/30 hover:bg-purple-950/60 cursor-pointer'
                          : u.role === 'DEVELOPER'
                          ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/60 cursor-pointer'
                          : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800 cursor-pointer'
                      }`}
                    >
                      {u.role} {!isOwner && '✏️'}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/40 text-red-400 border border-red-500/30 animate-pulse">
                        SUSPENDED
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs text-zinc-300">
                    ₹ {Number(u.walletBalance || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-[11px] text-zinc-400">
                    {u._count?.games || 0} games &bull; {u._count?.library || 0} library &bull; {u._count?.payments || 0} orders
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!isOwner ? (
                      <button
                        onClick={() => handleToggleSuspension(u.id, u.username, u.isActive)}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          u.isActive
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.isActive ? 'Suspend User' : 'Restore Account'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-600 uppercase">[ ROOT IMMUNE ]</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-zinc-500 font-mono">
                  {loading ? 'Scanning citizen registry...' : 'No users found matching query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

