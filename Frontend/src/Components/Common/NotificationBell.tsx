import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Star,
  MessageSquare,
  ShieldCheck,
  Coins,
  Radio,
  ExternalLink,
  Trash2,
  X,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket, type PlatformNotification } from '../../Context/SocketContext';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: PlatformNotification) => {
    markNotificationRead(notif.id);
    if (notif.targetUrl) {
      setIsOpen(false);
      navigate(notif.targetUrl);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  const getIcon = (type: PlatformNotification['type']) => {
    switch (type) {
      case 'REVIEW':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'DEVELOPER_REPLY':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'CERTIFICATION':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'SALE':
        return <Coins className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="relative font-sans select-none" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
        title="Real-Time Notification Center"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-purple-500 text-[10px] font-mono font-bold text-white shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#090C11] border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-neutral-800/80 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-mono text-neutral-400 hover:text-emerald-400 transition-colors px-1.5 py-0.5 rounded cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] font-mono text-neutral-500 hover:text-rose-400 transition-colors p-1 rounded cursor-pointer"
                    title="Clear notification list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Stream */}
            <div className="max-h-96 overflow-y-auto divide-y divide-neutral-900 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-25 text-neutral-400" />
                  <p>All caught up!</p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    No active notifications in your telemetry feed.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      !notif.read
                        ? 'bg-purple-950/20 hover:bg-purple-950/30 border-l-2 border-purple-500'
                        : 'hover:bg-neutral-900/40'
                    }`}
                  >
                    {/* Type Icon */}
                    <div className="p-2 rounded-xl bg-neutral-900/80 border border-white/5 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !notif.read ? 'text-white' : 'text-neutral-400'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.targetUrl && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-purple-400 group-hover:text-purple-300">
                          <span>View Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

