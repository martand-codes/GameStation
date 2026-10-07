import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto border border-neutral-800 rounded-xl p-8 bg-neutral-900/50">
        <h1 className="text-3xl font-bold mb-4 text-emerald-400">Welcome to the Portal</h1>
        
        <div className="bg-neutral-950 p-6 rounded-lg mb-6 border border-neutral-800">
          <p className="text-neutral-400 text-sm mb-1">Logged in as</p>
          <p className="text-xl font-mono text-white mb-4">{user?.username || 'Unknown Player'}</p>
          
          <p className="text-neutral-400 text-sm mb-1">Access Tier</p>
          <p className="text-md font-bold text-blue-400 tracking-widest">{user?.role || 'PLAYER'}</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={logout}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded font-bold transition-colors"
          >
            Logout
          </button>
          
          {(user?.role === 'DEVELOPER' || user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <button 
              onClick={() => navigate('/developer/portal')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold transition-colors"
            >
              Developer Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
