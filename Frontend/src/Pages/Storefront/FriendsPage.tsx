import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  MessageSquare,
  Send,
  Gamepad2,
  Check,
  X,
  UserMinus,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Crown,
  Code,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import { useSocket } from '../../Context/SocketContext';
import {
  getFriendsAPI,
  sendFriendRequestAPI,
  respondToFriendRequestAPI,
  removeFriendAPI,
  getDirectMessagesAPI,
  sendDirectMessageAPI,
  type FriendItem,
  type FriendsDataResponse,
  type DirectMessageItem,
} from '../../Services/Friend.service';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function FriendsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeSessions, socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FriendsDataResponse>({
    friends: [],
    pendingIncoming: [],
    pendingOutgoing: [],
  });

  // Selected Friend for Chat
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Tabs & Search
  const [activeTab, setActiveTab] = useState<'ALL' | 'ONLINE' | 'REQUESTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Friend Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addUsernameInput, setAddUsernameInput] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Friends Data
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await getFriendsAPI();
      setData(res);

      // If URL has ?chatWith=userId, automatically open chat with that friend
      const targetChatId = searchParams.get('chatWith');
      if (targetChatId && res?.friends) {
        const found = res.friends.find((f) => f.id === targetChatId);
        if (found) setSelectedFriend(found);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch friends network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Fetch Chat Messages when selectedFriend changes
  useEffect(() => {
    if (!selectedFriend) {
      setMessages([]);
      return;
    }

    const fetchChat = async () => {
      try {
        setLoadingMessages(true);
        const history = await getDirectMessagesAPI(selectedFriend.id);
        setMessages(history);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load message history.');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchChat();
  }, [selectedFriend?.id]);

  // Real-Time WebSocket Incoming Chat Messages Listener
  useEffect(() => {
    if (!socket || !user) return;

    const eventName = `chat:message:user:${user.id}`;
    const handleIncomingMessage = (newMsg: DirectMessageItem) => {
      if (
        selectedFriend &&
        (newMsg.senderId === selectedFriend.id || newMsg.receiverId === selectedFriend.id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    socket.on(eventName, handleIncomingMessage);

    return () => {
      socket.off(eventName, handleIncomingMessage);
    };
  }, [socket, user?.id, selectedFriend?.id]);

  // Actions
  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsernameInput.trim()) {
      toast.warning('Please enter a username.');
      return;
    }

    try {
      setAddingFriend(true);
      const res = await sendFriendRequestAPI(addUsernameInput.trim());
      toast.success(res.message);
      setAddUsernameInput('');
      setIsAddModalOpen(false);
      fetchFriends();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send friend request.');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleRespondRequest = async (friendshipId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const res = await respondToFriendRequestAPI(friendshipId, action);
      toast.success(res.message);
      fetchFriends();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process request.');
    }
  };

  const handleRemoveFriend = async (friendshipId: string, username: string) => {
    if (!confirm(`Are you sure you want to remove @${username} from your friends roster?`)) return;

    try {
      const res = await removeFriendAPI(friendshipId);
      toast.info(res.message);
      if (selectedFriend?.friendshipId === friendshipId) {
        setSelectedFriend(null);
      }
      fetchFriends();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove friend.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !messageInput.trim()) return;

    const textToSend = messageInput.trim();
    setMessageInput('');

    try {
      setSendingMessage(true);
      const sent = await sendDirectMessageAPI(selectedFriend.id, textToSend);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch message.');
      setMessageInput(textToSend); // restore unsent text
    } finally {
      setSendingMessage(false);
      chatInputRef.current?.focus();
    }
  };

  // Helper: check if a friend is in an active game session
  const getFriendPresence = (friendId: string) => {
    const session = activeSessions.find((s) => s.userId === friendId);
    if (session) {
      return {
        status: 'IN_GAME',
        label: `In-Game: ${session.gameTitle}`,
        gameTitle: session.gameTitle,
        gameId: session.gameId,
      };
    }
    return {
      status: 'OFFLINE',
      label: 'Offline',
    };
  };

  // Filter Friends
  const filteredFriends = data.friends.filter((friend) => {
    const matchesQuery = friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (activeTab === 'ONLINE') {
      const presence = getFriendPresence(friend.id);
      return presence.status === 'IN_GAME';
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-red-400 bg-red-950/40 border border-red-500/30 px-1.5 py-0.5 rounded">
            <Crown className="w-2.5 h-2.5" /> ROOT
          </span>
        );
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-blue-400 bg-blue-950/40 border border-blue-500/30 px-1.5 py-0.5 rounded">
            <ShieldCheck className="w-2.5 h-2.5" /> STAFF
          </span>
        );
      case 'DEVELOPER':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            <Code className="w-2.5 h-2.5" /> DEV
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="font-sans select-none max-w-7xl mx-auto h-[calc(100vh-220px)] min-h-[480px] flex flex-col">
      {/* ── Top Bar Strip ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2633]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <Users className="w-3 h-3 text-purple-400" />
              Social Network &bull; Live Telemetry
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-white font-mono mt-1">
            Squad Roster &amp; Direct Transmissions
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
          <button
            onClick={fetchFriends}
            disabled={loading}
            className="p-2 rounded-xl bg-[#0B0E14] hover:bg-neutral-800 border border-[#1E2633] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Sync Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Main Workspace Body (Responsive Split Pane) ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden mt-4 rounded-2xl border border-[#1E2633] bg-[#07090E] shadow-2xl">
        {/* ── Left Pane: Friends Roster & Requests (Collapsible on mobile when chat open) ── */}
        <div
          className={`${
            selectedFriend ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-96 flex-col border-r border-[#1E2633] bg-[#0A0D14] shrink-0`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-[#1E2633]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search squad by @username..."
                className="w-full bg-[#05070B] border border-[#1E2633] focus:border-purple-500 pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-mono transition-colors"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#1E2633] px-2 pt-2 gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-2 text-center border-b-2 font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              All ({data.friends.length})
            </button>
            <button
              onClick={() => setActiveTab('ONLINE')}
              className={`flex-1 py-2 text-center border-b-2 font-bold transition-all ${
                activeTab === 'ONLINE'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              In-Game ({activeSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`flex-1 py-2 text-center border-b-2 font-bold transition-all relative ${
                activeTab === 'REQUESTS'
                  ? 'border-amber-500 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Requests ({data.pendingIncoming.length})
              {data.pendingIncoming.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-2 right-2 animate-ping" />
              )}
            </button>
          </div>

          {/* Roster Stream */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {loading ? (
              <div className="text-center py-16 text-neutral-500 font-mono text-xs animate-pulse">
                SYNCING_SQUAD_TELEMETRY...
              </div>
            ) : activeTab === 'REQUESTS' ? (
              /* Pending Requests View */
              <div className="space-y-2 p-1">
                {data.pendingIncoming.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                    No pending friend invitations.
                  </div>
                ) : (
                  data.pendingIncoming.map((req) => (
                    <div
                      key={req.friendshipId}
                      className="p-3 rounded-xl bg-neutral-900/40 border border-amber-500/20 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-300 text-xs shrink-0">
                            {req.sender.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              @{req.sender.username}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Wants to connect
                            </span>
                          </div>
                        </div>
                        {getRoleBadge(req.sender.role)}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleRespondRequest(req.friendshipId, 'ACCEPT')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold tracking-wider transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> ACCEPT
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.friendshipId, 'DECLINE')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[10px] font-bold tracking-wider transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" /> DECLINE
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 font-mono text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
                <p>No squad members located.</p>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Click "+ Add Friend" to connect by username.
                </p>
              </div>
            ) : (
              /* Friends List */
              filteredFriends.map((friend) => {
                const presence = getFriendPresence(friend.id);
                const isSelected = selectedFriend?.id === friend.id;

                return (
                  <div
                    key={friend.friendshipId}
                    onClick={() => setSelectedFriend(friend)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group border ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'bg-neutral-900/30 hover:bg-neutral-900/60 border-transparent hover:border-[#1E2633]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center font-mono font-bold text-white text-xs">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        {/* Live Presence Dot */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0D14] ${
                            presence.status === 'IN_GAME'
                              ? 'bg-purple-500 animate-pulse'
                              : 'bg-neutral-600'
                          }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            @{friend.username}
                          </span>
                          {getRoleBadge(friend.role)}
                        </div>

                        <span
                          className={`text-[10px] font-mono truncate block ${
                            presence.status === 'IN_GAME'
                              ? 'text-purple-400 font-bold'
                              : 'text-neutral-500'
                          }`}
                        >
                          {presence.label}
                        </span>
                      </div>
                    </div>

                    {/* Chat Action Icon */}
                    <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-3.5 h-3.5 text-neutral-400 group-hover:text-purple-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Pane: Direct Chat & Squad Transmission Workspace ──────────────── */}
        <div
          className={`${
            selectedFriend ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-[#06080D] overflow-hidden`}
        >
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-[#1E2633] flex items-center justify-between bg-[#0A0D14]">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-purple-300 text-xs shrink-0">
                    {selectedFriend.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        @{selectedFriend.username}
                      </span>
                      {getRoleBadge(selectedFriend.role)}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      {(() => {
                        const presence = getFriendPresence(selectedFriend.id);
                        if (presence.status === 'IN_GAME') {
                          return (
                            <span className="text-purple-400 flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                              {presence.label}
                            </span>
                          );
                        }
                        return <span className="text-neutral-500">Offline Matrix</span>;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleRemoveFriend(selectedFriend.friendshipId, selectedFriend.username)
                    }
                    className="p-1.5 rounded-lg hover:bg-red-950/30 text-neutral-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                    title="Remove from squad"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message History Canvas */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loadingMessages ? (
                  <div className="text-center py-20 text-neutral-500 font-mono text-xs animate-pulse">
                    ESTABLISHING_ENCRYPTED_TRANSMISSION...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-24 text-neutral-500 font-mono text-xs">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-purple-400" />
                    <p>No messages yet with @{selectedFriend.username}.</p>
                    <p className="text-[10px] text-neutral-600 mt-1">
                      Type below to send an encrypted direct transmission.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs font-sans leading-relaxed break-words shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                              : 'bg-neutral-900 border border-[#1E2633] text-neutral-200 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Console */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#1E2633] bg-[#0A0D14] flex items-center gap-2"
              >
                <input
                  ref={chatInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Send direct transmission to @${selectedFriend.username}...`}
                  disabled={sendingMessage}
                  className="flex-1 bg-[#05070B] border border-[#1E2633] focus:border-purple-500 px-4 py-2 rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-mono transition-colors"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !messageInput.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            /* Empty State when no friend selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 font-mono">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Squad Communications Station</h3>
              <p className="text-xs text-neutral-400 max-w-sm font-sans mb-6">
                Select a squad member from your roster to view live gameplay telemetry and send
                real-time direct transmissions.
              </p>

              {data.friends.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                  {data.friends.slice(0, 4).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFriend(f)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-[#1E2633] text-xs text-neutral-300 font-mono transition-colors cursor-pointer"
                    >
                      @{f.username}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Friend Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#090C11] border border-purple-500/30 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Add Player to Squad
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-400 font-sans">
                Enter the player's username (e.g. <span className="font-mono text-purple-300">Player@02</span>). They will receive an instant WebSocket invitation.
              </p>

              <form onSubmit={handleSendFriendRequest} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neutral-500 text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    value={addUsernameInput}
                    onChange={(e) => setAddUsernameInput(e.target.value)}
                    placeholder="Player@02"
                    autoFocus
                    className="w-full bg-[#05070B] border border-[#1E2633] focus:border-purple-500 pl-8 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-neutral-600 outline-none font-mono transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingFriend || !addUsernameInput.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                  >
                    {addingFriend ? 'Dispatching...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
