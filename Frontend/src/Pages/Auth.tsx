import { useState } from "react";
import { Gamepad2, Code2, User, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { loginAPI, registerAPI } from "../Services/Auth.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

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
  const [showPassword, setShowPassword] = useState(false); // NEW STATE
  const [errorMsg, setErrorMsg] = useState("");

  const activeGlow = isLogin ? "bg-blue-600" : "bg-emerald-600";
  const btnStyle = isLogin 
    ? "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
    : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
  const focusStyle = isLogin 
    ? "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50" 
    : "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50";
  const linkStyle = isLogin 
    ? "text-blue-400 hover:text-blue-300" 
    : "text-emerald-400 hover:text-emerald-300";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 border-r border-neutral-900/50 relative">
        <div className={`absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000 mix-blend-screen ${activeGlow}`} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="z-10 text-center">
          <h1 className="text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl">
            <span className="text-red-600">GAME</span><span className="text-white">STATION</span>
          </h1>
          <div className="h-1.5 w-24 bg-red-600 mx-auto mb-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)]" />
          <p className="text-neutral-400 text-sm uppercase tracking-[0.3em] font-mono font-semibold">
            Next-Gen Deployment
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-20 xl:px-36 z-10 relative">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-10 lg:hidden transition-colors duration-1000 ${activeGlow}`} />

        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isLogin ? "Terminal Access" : "Network Registration"}
            </h2>
            <p className="text-neutral-400 text-sm">
              {isLogin ? "Authenticate to access the platform." : "Select your access tier and initialize credentials."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-semibold">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button type="button" onClick={() => setRole("PLAYER")} className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${role === "PLAYER" ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)] scale-105" : "border-neutral-800 bg-neutral-950/50 text-neutral-500 hover:border-neutral-700"}`}>
                  <Gamepad2 className="w-6 h-6" />
                  <span className="font-bold text-xs tracking-wider">PLAYER</span>
                </button>
                <button type="button" onClick={() => setRole("DEVELOPER")} className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${role === "DEVELOPER" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105" : "border-neutral-800 bg-neutral-950/50 text-neutral-500 hover:border-neutral-700"}`}>
                  <Code2 className="w-6 h-6" />
                  <span className="font-bold text-xs tracking-wider">DEVELOPER</span>
                </button>
              </div>
            )}

            {isLogin ? (
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Username or Email</label>
                <div className="relative">
                  <User className="w-5 h-5 text-neutral-500 absolute left-3.5 top-3" />
                  <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={`w-full bg-neutral-900/50 border border-neutral-800 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all ${focusStyle}`} placeholder="Enter username or email" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Username</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-neutral-500 absolute left-3.5 top-3" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={`w-full bg-neutral-900/50 border border-neutral-800 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all ${focusStyle}`} placeholder="e.g. shadow_stalker" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-neutral-500 absolute left-3.5 top-3" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`w-full bg-neutral-900/50 border border-neutral-800 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all ${focusStyle}`} placeholder="player@gamestation.com" />
                  </div>
                </div>
              </>
            )}

            {/* UPDATED PASSWORD FIELD WITH EYE ICON */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-neutral-500 absolute left-3.5 top-3" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className={`w-full bg-neutral-900/50 border border-neutral-800 rounded-lg pl-11 pr-11 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all ${focusStyle}`} 
                  placeholder="••••••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className={`w-full mt-6 flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-lg transition-all duration-300 ${btnStyle}`}>
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span className="tracking-wider">{isLogin ? "INITIATE LOGIN" : "EXECUTE REGISTRATION"}</span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-neutral-500">
            {isLogin ? "No access credentials? " : "Already registered? "}
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }} className={`font-bold transition-colors underline underline-offset-4 ml-1 ${linkStyle}`}>
              {isLogin ? "Request Access." : "Sign In."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}