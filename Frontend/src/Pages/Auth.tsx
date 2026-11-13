import { useState } from "react";
import { 
  Gamepad2, 
  Code2, 
  User, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Crown, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Radio,
  RefreshCcw,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAPI, registerAPI } from "../Services/Auth.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import FloatingGamingBackground from "../Components/Common/FloatingGamingBackground";

interface PersonaConfig {
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'PLAYER';
  name: string;
  pass: string;
  title: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  glowColor: string;
  btnClass: string;
  icon: any;
  tagline: string;
  description: string;
  features: string[];
}

const DEMO_PERSONAS: PersonaConfig[] = [
  {
    role: 'OWNER',
    name: 'Demo_Owner',
    pass: 'DemoOwner@2026',
    title: 'Sovereign Owner',
    badge: 'SANDBOX ROOT',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    accentColor: 'text-red-400',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    btnClass: 'hover:border-red-500 hover:bg-red-500/10 text-red-300',
    icon: Crown,
    tagline: 'Platform Root & APM Observability',
    description: 'Sandbox master access to explore real-time telemetry, distributed flame graphs, financial ledgers, and emergency switches.',
    features: [
      'W3C OpenTelemetry APM & Flame Graph Engine',
      'Emergency Break-Glass Killswitches (Self-Healing)',
      'Platform Treasury Ledger & Disbursal Authorization',
      'Live Storefront Campaign Engine & Dynamic Banners'
    ]
  },
  {
    role: 'ADMIN',
    name: 'Admin@GS01',
    pass: 'Admin@01',
    title: 'Operations Admin',
    badge: 'STAFF LEVEL-1',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    accentColor: 'text-blue-400',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    btnClass: 'hover:border-blue-500 hover:bg-blue-500/10 text-blue-300',
    icon: ShieldCheck,
    tagline: 'Certification & Store Governance',
    description: 'Level-1 operator clearance to audit game releases, review QA dossiers, and issue staff directives.',
    features: [
      'Game Certification Desk & Technical QA Dossiers',
      'Storefront Catalog Moderation (Publish, Delist, Quarantine)',
      'Citizen User Registry & Administrative Disciplinary Directives',
      'Real-time Security & Staff Action Audit Trail'
    ]
  },
  {
    role: 'DEVELOPER',
    name: 'RockstarGames',
    pass: 'rockstar@001',
    title: 'Game Studio Developer',
    badge: 'STUDIO PARTNER',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    btnClass: 'hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-300',
    icon: Code2,
    tagline: 'Studio Pipeline & Webhook Dispatch',
    description: 'Developer workspace to configure game engines, view royalty splits, and manage cryptographic webhooks.',
    features: [
      'Game Publishing Pipeline & Multi-Edition Pricing (₹)',
      'Real-time Revenue Analytics & 70/30 Royalty Settlement',
      'HMAC-SHA256 Webhook Delivery Engine with DLQ',
      'Review Management & Verified Player Ratings'
    ]
  },
  {
    role: 'PLAYER',
    name: 'Player@01',
    pass: 'Player@01',
    title: 'Citizen Player',
    badge: 'VERIFIED GAMER',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    accentColor: 'text-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    btnClass: 'hover:border-purple-500 hover:bg-purple-500/10 text-purple-300',
    icon: Gamepad2,
    tagline: 'Storefront & Distributed Checkout',
    description: 'Digital consumer experience powered by Distributed Saga transactions and real-time social presence.',
    features: [
      'Storefront Discovery with BM25 & Fuzzy Trie Search',
      'Distributed Saga Checkout (Forward Execution & Rollback)',
      'Player Library, Session Tracking & Review Ratings',
      'GameStation Points Wallet & Top-up Recharges (₹ INR)'
    ]
  }
];

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"PLAYER" | "DEVELOPER">("PLAYER");
  
  // Form State
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hover & Active Persona State
  const [hoveredPersona, setHoveredPersona] = useState<PersonaConfig | null>(null);
  const [activePersonaRole, setActivePersonaRole] = useState<string | null>(null);

  const handleQuickLogin = async (p: PersonaConfig) => {
    setActivePersonaRole(p.role);
    setIsLogin(true);
    setIdentifier(p.name);
    setPassword(p.pass);
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const data = await loginAPI(p.name, p.pass);
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/dashboard');
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const issues = data.errors.map((err: any) => err.message).join(" | ");
        setErrorMsg(`Validation Failed: ${issues}`);
      } else {
        setErrorMsg(data?.message || "Authentication rejected by security gateway.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const data = await loginAPI(identifier, password);
        login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
        navigate('/dashboard');
      } else {
        const data = await registerAPI(username, email, password, role);
        login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
        navigate('/dashboard');
      }
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const issues = data.errors.map((err: any) => err.message).join(" | ");
        setErrorMsg(`Validation Failed: ${issues}`);
      } else {
        setErrorMsg(data?.message || "An error occurred connecting to the network.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-red-500/30 selection:text-white">
      {/* Dynamic Cybernetic Gaming Ambient Background */}
      <FloatingGamingBackground />

      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        {/* Branding & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              Sliding-Window Shield Active (50 req/min)
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white flex items-center justify-center gap-1">
            <span className="text-red-500">GAME</span>STATION
          </h1>
        </div>

        {/* ============================================================== */}
        {/* QUICK DEMO ACCESS: Sleek 4-Pill Trigger Bar with Hover Popovers */}
        {/* ============================================================== */}
        <div className="w-full mb-6 relative">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Role Access (Click to Launch)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
              Hover to inspect features
            </span>
          </div>

          {/* 4 Interactive Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEMO_PERSONAS.map((p) => {
              const Icon = p.icon;
              const isCurrent = activePersonaRole === p.role;

              return (
                <div
                  key={p.role}
                  className="relative"
                  onMouseEnter={() => setHoveredPersona(p)}
                  onMouseLeave={() => setHoveredPersona(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(p)}
                    disabled={isSubmitting}
                    className={`w-full py-2.5 px-2 rounded-xl border bg-[#0D101A]/90 backdrop-blur-md text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${p.btnClass} ${
                      isCurrent ? 'ring-2 ring-red-500 border-red-500 bg-red-500/10' : 'border-white/[0.08]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${p.accentColor}`} />
                    <span className="truncate">{p.title.split(' ')[0]}</span>
                    <Zap className="w-2.5 h-2.5 opacity-60 ml-0.5 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Hover Popover Modal Card */}
          <AnimatePresence>
            {hoveredPersona && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2.5 z-50 p-4 rounded-2xl bg-[#090C14]/95 border border-white/20 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] pointer-events-none"
                style={{
                  boxShadow: `0 10px 30px ${hoveredPersona.glowColor}`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <hoveredPersona.icon className={`w-4 h-4 ${hoveredPersona.accentColor}`} />
                    <h3 className="text-sm font-bold text-white">
                      {hoveredPersona.title}
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      (@{hoveredPersona.name})
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${hoveredPersona.badgeColor}`}>
                    {hoveredPersona.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                  {hoveredPersona.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-white/[0.08]">
                  {hoveredPersona.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================== */}
        {/* MAIN TERMINAL LOGIN / REGISTRATION CARD                        */}
        {/* ============================================================== */}
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-[#080B12]/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? "Terminal Access" : "Network Registration"}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isLogin ? "Authenticate to access the platform." : "Initialize a citizen node and credentials."}
              </p>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 border border-white/[0.06] px-2 py-1 rounded-md">
              SEC-LVL 3
            </div>
          </div>

          {/* Active Error / Rate-Limit Alert Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-start gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-relaxed">
                  {errorMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Registration Role Selection */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setRole("PLAYER")}
                  className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === "PLAYER" 
                      ? "border-purple-500 bg-purple-500/15 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                      : "border-white/[0.08] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-bold text-xs tracking-wider">CITIZEN PLAYER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("DEVELOPER")}
                  className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === "DEVELOPER" 
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                      : "border-white/[0.08] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span className="font-bold text-xs tracking-wider">GAME STUDIO</span>
                </button>
              </div>
            )}

            {/* Identifier Input */}
            {isLogin ? (
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Citizen Handle or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full bg-[#0D101A] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500/40 font-mono"
                    placeholder="Enter username or email"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Citizen Handle
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full bg-[#0D101A] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500/40 font-mono"
                      placeholder="e.g. shadow_stalker"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    Email Network Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#0D101A] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500/40 font-mono"
                      placeholder="player@gamestation.com"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Input with Eye Toggle */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Passcode / Clearance Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0D101A] border border-white/[0.1] rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500/40 font-mono tracking-wider"
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 text-white font-mono font-bold py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-all duration-300 cursor-pointer active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="tracking-wider">AUTHENTICATING...</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span className="tracking-wider">INITIATE TERMINAL LOGIN</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span className="tracking-wider">INITIALIZE NODE REGISTRATION</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center text-xs font-mono text-zinc-400">
            {isLogin ? "No citizen credentials? " : "Already initialized node? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
              }}
              className="font-bold text-red-400 hover:text-red-300 transition-colors underline underline-offset-4 ml-1 cursor-pointer"
            >
              {isLogin ? "Request Registration." : "Sign In."}
            </button>
          </div>

          {/* Sovereign Genesis Authority Link */}
          <div className="mt-6 pt-3.5 border-t border-white/[0.06] text-center">
            <a
              href="/platform/claim-ownership"
              className="text-[11px] font-mono text-zinc-400 hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-red-500/80" />
              <span>Genesis Root Authority &bull; Anchored to <span className="text-white font-bold">@Martand_Prakhar</span></span>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
            </a>
          </div>
        </div>

        {/* ── DISTRIBUTED INFRASTRUCTURE HIGHLIGHTS ────────────────── */}
        <div className="mt-7 w-full max-w-xl mx-auto">
          <div className="text-center mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Distributed Core Architecture &bull; Engineering Stack
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-left">
            {/* 1. Stripe Payment Gateway */}
            <div className="p-3 rounded-xl bg-[#080B12]/90 border border-white/[0.07] hover:border-emerald-500/30 transition-all group shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] text-emerald-400/90 font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
                  STRIPE
                </span>
              </div>
              <div className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-300 transition-colors">
                Payment Gateway
              </div>
              <div className="text-[9px] text-zinc-400 font-sans mt-0.5 leading-tight">
                PCI-DSS Level-1 captures with HMAC-SHA256 webhooks
              </div>
            </div>

            {/* 2. Sliding-Window Rate Limiter */}
            <div className="p-3 rounded-xl bg-[#080B12]/90 border border-white/[0.07] hover:border-cyan-500/30 transition-all group shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] text-cyan-400/90 font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30">
                  SHIELD
                </span>
              </div>
              <div className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-cyan-300 transition-colors">
                Rate Limiter
              </div>
              <div className="text-[9px] text-zinc-400 font-sans mt-0.5 leading-tight">
                Sliding-Window log ring buffer (50 req/min auth)
              </div>
            </div>

            {/* 3. Real-Time WebSockets */}
            <div className="p-3 rounded-xl bg-[#080B12]/90 border border-white/[0.07] hover:border-purple-500/30 transition-all group shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] text-purple-400/90 font-bold px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-500/30">
                  WS V4
                </span>
              </div>
              <div className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                WebSockets
              </div>
              <div className="text-[9px] text-zinc-400 font-sans mt-0.5 leading-tight">
                Live presence, instant chat &amp; APM telemetry streaming
              </div>
            </div>

            {/* 4. 4-Phase Saga Checkout */}
            <div className="p-3 rounded-xl bg-[#080B12]/90 border border-white/[0.07] hover:border-red-500/30 transition-all group shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <RefreshCcw className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] text-red-400/90 font-bold px-1.5 py-0.2 rounded bg-red-950/60 border border-red-500/30">
                  4-PHASE
                </span>
              </div>
              <div className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-red-300 transition-colors">
                Distributed Saga
              </div>
              <div className="text-[9px] text-zinc-400 font-sans mt-0.5 leading-tight">
                Wallet Lock &rarr; Capture &rarr; Minting &amp; Auto-Rollback
              </div>
            </div>
          </div>
        </div>

        {/* Footer Technical Metadata */}
        <div className="mt-5 text-center text-[10px] font-mono text-zinc-400 flex items-center justify-center gap-3">
          <span>DISTRIBUTED SAGA v2.4</span>
          <span>&bull;</span>
          <span>HMAC-SHA256 WEBHOOK ENGINE</span>
          <span>&bull;</span>
          <span>W3C OPENTELEMETRY</span>
          <span>&bull;</span>
          <span>CURRENCY: ₹ (INR)</span>
        </div>
      </div>
    </div>
  );
}
