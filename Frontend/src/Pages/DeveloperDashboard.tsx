import React from 'react';
import { Activity, Users, DollarSign, Gamepad2 } from 'lucide-react';

export default function DeveloperDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Command Center</h1>
        <p className="text-neutral-400 font-mono text-sm">Welcome back to the forge.</p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 font-bold">Active Titles</h3>
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-black">3</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 font-bold">Total Acquisition</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-black">8,630</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 font-bold">Net Revenue</h3>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-black">₹63,500</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Performance */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <h3 className="font-bold text-lg">Game Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-950/50">
                <tr>
                  <th className="p-4 text-neutral-400 font-mono text-xs uppercase tracking-wider">Game</th>
                  <th className="p-4 text-neutral-400 font-mono text-xs uppercase tracking-wider">Players</th>
                  <th className="p-4 text-neutral-400 font-mono text-xs uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                <tr className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 font-bold">Neon Horizon</td>
                  <td className="p-4 font-mono">5,420</td>
                  <td className="p-4 font-mono text-emerald-400">₹42,000</td>
                </tr>
                <tr className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 font-bold">Cyber Drift</td>
                  <td className="p-4 font-mono">3,210</td>
                  <td className="p-4 font-mono text-emerald-400">₹21,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="p-6 border-b border-neutral-800">
            <h3 className="font-bold text-lg">Recent Activity</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm"><strong>Neon Horizon</strong> was approved</p>
                <p className="text-xs text-neutral-500 font-mono mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm"><strong>Cyber Drift</strong> reached 1,000 plays</p>
                <p className="text-xs text-neutral-500 font-mono mt-1">Yesterday</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm"><strong>Neon Horizon</strong> generated ₹5,000</p>
                <p className="text-xs text-neutral-500 font-mono mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
