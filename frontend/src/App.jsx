import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Settings,
  FileText,
  Cpu,
  Award,
  Zap,
  Play,
  CheckCircle,
  ChevronRight,
  Brain,
  Video,
  MicOff,
  RefreshCw,
  Home,
  User,
  LogOut,
  Lock,
  Mail,
  ArrowRight,
  Clock,
  Calendar,
  Briefcase,
  Target,
  Upload,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Volume,
  MessageSquare,
  Layers,
  Activity,
  Star,
  MapPin,
  Shield,
  Code,
  Flame,
  LayoutGrid,
  BarChart,
  Search,
  Check,
  Square,
  FileCheck,
  Eye,
  X
} from 'lucide-react';

// --- Utility Hook for Scroll Animations ---
const useInView = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect(); // Trigger once
      }
    }, options);
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isInView];
};

// --- Shared UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = 'button', disabled = false, style = {} }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:brightness-110",
    secondary: "bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-slate-700 hover:border-cyan-500/60",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
    glass: "backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    success: "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30",
    glow: "bg-white text-blue-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] hover:scale-105"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const Input = ({ type = "text", placeholder, icon: Icon, value, onChange }) => (
  <div className="relative w-full group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
      {Icon && <Icon size={18} />}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
    />
  </div>
);

const Select = ({ options, icon: Icon, placeholder }) => (
  <div className="relative w-full group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
      {Icon && <Icon size={18} />}
    </div>
    <select
      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none transition-all"
      defaultValue=""
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
      <ChevronRight size={16} className="rotate-90" />
    </div>
  </div>
);

const Card = ({ children, className = '', glow = false, onClick, style = {} }) => (
  <div
    onClick={onClick}
    style={style}
    className={`backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 ${glow ? 'shadow-[0_0_30px_rgba(6,182,212,0.15)] border-cyan-500/30' : ''} ${onClick ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-lg' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Constants & Mock Data ---

const MOCK_QUESTIONS = [
  { id: 1, text: "Can you explain how the Virtual DOM works in React?", difficulty: "Medium", focus: "Technical Accuracy", topic: "React Core" },
  { id: 2, text: "How would you architect a scalable microservices backend?", difficulty: "Hard", focus: "System Design", topic: "Architecture" },
  { id: 3, text: "Describe a time you had a conflict with a product manager.", difficulty: "Medium", focus: "Communication", topic: "Behavioral" }
];

// --- Visual Components ---

const AudioVisualizer = ({ isActive }) => (
  <div className="flex items-center justify-center gap-1 h-8">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className={`w-1.5 rounded-full bg-cyan-400 transition-all duration-75 ${isActive ? 'animate-pulse' : 'h-1 opacity-20'
          }`}
        style={{
          height: isActive ? `${Math.max(4, Math.random() * 32)}px` : '4px',
          animationDelay: `${i * 0.05}s`
        }}
      />
    ))}
  </div>
);

const OrbitalSystem = ({ centerIcon: CenterIcon, orbitingIcons, label, color = "cyan", delay = 0 }) => {
  return (
    <div
      className="absolute flex items-center justify-center animate-spin-slow pointer-events-none z-0 opacity-80 transition-opacity duration-500"
      style={{
        left: '50%', top: '50%', width: '600px', height: '600px',
        marginLeft: '-300px', marginTop: '-300px',
        animationDelay: `${delay}s`, animationDuration: '40s'
      }}
    >
      <div className={`w-full h-full border-2 border-${color}-500/30 rounded-full absolute shadow-[0_0_50px_rgba(34,211,238,0.15)]`}>
        {orbitingIcons.map((Icon, idx) => {
          if (!Icon) return null;
          const angle = (360 / orbitingIcons.length) * idx;
          return (
            <div
              key={idx}
              className={`absolute w-14 h-14 bg-slate-900 border-2 border-${color}-500/70 rounded-full flex items-center justify-center text-${color}-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]`}
              style={{
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(300px) rotate(-${angle}deg)`
              }}
            >
              <Icon size={24} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdvancedBot = () => (
  <div className="relative group cursor-pointer w-64 h-64 flex items-center justify-center">
    <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full animate-pulse-slow"></div>
    <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }}>
      <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
    </div>
    <div className="relative w-32 h-32 bg-slate-900/80 backdrop-blur-md border border-cyan-400/60 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)] z-10 transform group-hover:scale-105 transition-transform duration-300">
      <div className="absolute -top-6 w-12 h-1 bg-cyan-500/50 rounded-full"></div>
      <Cpu size={56} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      <div className="flex gap-4 mt-3">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-blink shadow-[0_0_8px_white]"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-blink shadow-[0_0_8px_white]"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-scan rounded-3xl pointer-events-none"></div>
    </div>
    <div className="absolute -bottom-10 bg-slate-900/90 border border-cyan-500/50 px-4 py-1.5 rounded-full text-cyan-300 text-xs font-bold tracking-widest shadow-lg">
      AI INTERVIEWER
    </div>
  </div>
);

const AdvancedResumeScanner = () => (
  <div className="relative w-56 h-72 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl flex flex-col items-center pt-8 overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500">
    <div className="absolute inset-4 bg-white/5 rounded-lg"></div>
    <div className="w-32 h-3 bg-slate-600 rounded mb-4 shadow-sm"></div>
    <div className="w-40 h-2 bg-slate-600/50 rounded mb-3"></div>
    <div className="w-36 h-2 bg-slate-600/50 rounded mb-3"></div>
    <div className="w-40 h-2 bg-slate-600/50 rounded mb-6"></div>
    <div className="w-24 h-3 bg-slate-600 rounded mb-3"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,1)] animate-scan z-20"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent z-10 animate-scan-overlay"></div>
    <div className="absolute bottom-8 scale-0 animate-pop-in bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(34,197,94,0.5)] z-30">
      <Check size={18} fill="white" className="text-green-600" /> MATCH 98%
    </div>
  </div>
);

const AnimatedGraph = () => {
  const [graphRef, isInView] = useInView({ threshold: 0.5 });
  return (
    <div ref={graphRef} className="relative w-80 h-56 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl overflow-hidden group hover:border-green-500/30 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
            <TrendingUp size={18} />
          </div>
          <span className="text-slate-300 font-bold text-sm">Growth Rate</span>
        </div>
        <span className="text-green-400 font-mono font-bold">+145%</span>
      </div>
      <div className="relative h-24 w-full">
        <div className="absolute inset-0 flex flex-col justify-between opacity-10">
          <div className="w-full h-px bg-white"></div>
          <div className="w-full h-px bg-white"></div>
          <div className="w-full h-px bg-white"></div>
        </div>
        <svg className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
          </defs>
          {isInView && (
            <>
              <path d="M0,100 C40,90 80,80 120,40 C160,0 200,60 280,10" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" className="animate-draw-path" />
              <path d="M0,100 C40,90 80,80 120,40 C160,0 200,60 280,10 V120 H0 Z" fill="url(#lineGradient)" className="animate-fade-in-delayed opacity-0" />
              <circle cx="280" cy="10" r="4" fill="#4ade80" className="animate-ping-slow" />
              <circle cx="280" cy="10" r="4" fill="white" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

const AdvancedBadge = () => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
    <div className="relative w-32 h-36 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-yellow-500/50 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)] overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-[200%] animate-shine"></div>
      <Award size={48} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] mb-2" />
      <div className="text-center">
        <div className="text-[10px] text-yellow-200 uppercase tracking-widest">Certified</div>
        <div className="text-lg font-black text-white">TOP 1%</div>
      </div>
    </div>
    <Star size={16} className="absolute top-4 left-4 text-yellow-400 animate-bounce-subtle" fill="currentColor" />
    <Star size={12} className="absolute bottom-8 right-4 text-yellow-300 animate-bounce-subtle" fill="currentColor" style={{ animationDelay: '1s' }} />
  </div>
);

const AutoChecklist = () => {
  const [items, setItems] = useState([
    { text: "Analyze Resume", checked: false },
    { text: "Generate Questions", checked: false },
    { text: "Schedule Interview", checked: false },
    { text: "Prepare Feedback", checked: false }
  ]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setItems(prev => prev.map((item, idx) =>
        idx === currentIndex ? { ...item, checked: true } : item
      ));
      currentIndex = (currentIndex + 1) % items.length;
      if (currentIndex === 0) {
        setTimeout(() => { setItems(prev => prev.map(item => ({ ...item, checked: false }))); }, 1000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 w-64 shadow-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
        <CheckCircle className="text-cyan-400" size={20} />
        <span className="font-bold text-white text-sm uppercase tracking-wider">AI Task Queue</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-300 ${item.checked ? 'bg-green-500 text-white scale-110' : 'bg-slate-800 border border-slate-600'}`}>
              {item.checked && <CheckCircle size={14} />}
            </div>
            <span className={`text-sm transition-all duration-300 ${item.checked ? 'text-slate-200 line-through decoration-slate-500' : 'text-slate-400'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// AUTHENTICATION VIEWS
// ============================================================================

const LoginView = ({ onLogin, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await onLogin(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 animate-fade-in-up relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-float-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-50">
        <div className="p-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6">
            <Zap size={24} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 mb-8">Continue your journey to interview mastery.</p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <Input icon={Mail} type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <Input icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button onClick={handleSubmit} variant="primary" className="w-full mt-4" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={20} /> : "Login"}
            </Button>

            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm mb-3">Don't have an account?</p>
              <button
                onClick={onSignupClick}
                className="text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors"
              >
                Create Account →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignupView = ({ onSignup, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await onSignup(email, password, name);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 animate-fade-in-up relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-float-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-50">
        <div className="p-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6">
            <Zap size={24} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 mb-8">Start your interview preparation journey.</p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
              <Input icon={User} type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <Input icon={Mail} type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <Input icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button onClick={handleSubmit} variant="primary" className="w-full mt-4" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={20} /> : "Sign Up"}
            </Button>

            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm mb-3">Already have an account?</p>
              <button
                onClick={onLoginClick}
                className="text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors"
              >
                Login →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthView = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Merge profile data with user object for proper flow detection
        const profile = data.user.profile || {};
        const userData = {
          uid: data.user.uid,
          email: data.user.email,
          name: profile.name || '',
          role: profile.role || '',
          experience_years: profile.experience_years || '',
          salary_expectation: profile.salary_expectation || '',
          profile_completed: profile.profile_completed || !!profile.name
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('session', JSON.stringify(data.session));
        onAuthComplete(userData);
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSignup = async (email, password, name) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('name', name);

      const response = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return await handleLogin(email, password);
      } else {
        return { success: false, error: data.detail || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  if (isLogin) {
    return <LoginView onLogin={handleLogin} onSignupClick={() => setIsLogin(false)} />;
  } else {
    return <SignupView onSignup={handleSignup} onLoginClick={() => setIsLogin(true)} />;
  }
};

const TiltCard = ({ children, className }) => {
  const cardRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setGlowPos({ x, y });
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setGlowPos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-300 ease-out transform-style-3d relative overflow-hidden rounded-3xl ${className}`}
    >
      <div
        className="absolute w-64 h-64 bg-cyan-500/20 blur-[80px] pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ left: glowPos.x - 128, top: glowPos.y - 128, zIndex: 0 }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// --- VIEWS ---

const LandingView = ({ onStart }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full overflow-y-auto custom-scrollbar overflow-x-hidden bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="flex flex-col items-center w-full relative">
        {/* GLOBAL BACKGROUND PARTICLES */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: Math.random() * 4 + 1 + 'px',
                height: Math.random() * 4 + 1 + 'px',
                backgroundColor: Math.random() > 0.5 ? '#22d3ee' : '#a855f7',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
                transition: 'transform 0.5s ease-out'
              }}
            />
          ))}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/0 via-[#050510]/80 to-[#050510]"></div>
        </div>

        {/* HERO SECTION */}
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-20 z-10">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-100 pointer-events-none">
            <OrbitalSystem centerIcon={Brain} orbitingIcons={[FileText, Target, Activity]} label="" color="cyan" delay={0} />
            <div className="absolute w-[800px] h-[800px] border border-purple-500/20 rounded-full animate-spin-slow" style={{ animationDuration: '60s' }}></div>
            <div className="absolute w-[450px] h-[450px] border-2 border-green-500/10 rounded-full animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
          </div>

          <div className="relative z-20 text-center max-w-5xl px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Star size={16} className="animate-pulse" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Next Gen Interview Prep</span>
            </div>

            <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-purple-500 text-white mb-8 leading-tight tracking-tight drop-shadow-[0_0_40px_rgba(34,211,238,0.2)] bg-[length:200%_auto] animate-gradient-x hover:bg-right transition-all duration-500 cursor-default">
              INTERAURA
            </h1>

            <div className="h-8 md:h-12 mb-12 flex justify-center">
              <p className="text-xl md:text-2xl text-slate-400 font-mono border-r-4 border-cyan-500 pr-2 animate-typewriter overflow-hidden whitespace-nowrap w-fit">
                Real-time mock interviews + personalized feedback
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24 relative group">
              <button onClick={onStart} className="relative px-12 py-6 bg-white text-slate-900 text-xl font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-20 group-hover:opacity-40 animate-shine-slow"></div>
                <span className="relative z-10 flex items-center gap-3">
                  <Zap className="text-purple-600 group-hover:text-purple-800 transition-colors" fill="currentColor" />
                  START YOUR JOURNEY
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 animate-bounce text-slate-500 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest">Scroll Down</span>
            <ChevronRight className="rotate-90" />
          </div>
        </div>

        {/* SCROLL JOURNEY */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 space-y-40">
          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="order-2 md:order-1 max-w-md text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">AI Interviewer</h2>
              <p className="text-slate-400 text-lg">Meet your 24/7 mock interviewer. It adapts to your tone, asks follow-up questions, and simulates real interview pressure.</p>
            </div>
            <div className="order-1 md:order-2"><AdvancedBot /></div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div><AdvancedResumeScanner /></div>
            <div className="max-w-md text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Smart Resume Analysis</h2>
              <p className="text-slate-400 text-lg">Our engine scans your resume in seconds, identifying key skills and generating questions specifically tailored to your profile.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="order-2 md:order-1 max-w-md text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Track Your Growth</h2>
              <p className="text-slate-400 text-lg">Visualize your progress over time. Watch your confidence and technical accuracy scores climb with every practice session.</p>
            </div>
            <div className="order-1 md:order-2"><AnimatedGraph /></div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div><AdvancedBadge /></div>
            <div className="max-w-md text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Earn Recognition</h2>
              <p className="text-slate-400 text-lg">Unlock achievements and badges as you master different interview domains. Prove you're in the top 1% of candidates.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="order-2 md:order-1 max-w-md text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Automated Roadmap</h2>
              <p className="text-slate-400 text-lg">Never wonder what to study next. Our AI generates a daily checklist of tasks to keep your preparation on track.</p>
            </div>
            <div className="order-1 md:order-2"><AutoChecklist /></div>
          </div>
        </div>

        {/* CORE MODULES */}
        <div className="relative w-full py-32 px-6 max-w-7xl mx-auto z-10 mt-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-6">CORE SYSTEM MODULES</h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 perspective-1000">
            <TiltCard className="h-[450px] group bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent animate-pulse"></div>
                  <BookOpen size={48} className="text-cyan-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">Personalized Resources</h3>
                <p className="text-slate-300 leading-relaxed text-sm">Curated learning materials hand-picked by AI based on your specific performance gaps.</p>
                <div className="mt-auto w-full pt-6 border-t border-white/5">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-3 transition-all">Start Learning <ArrowRight size={14} /></span>
                </div>
              </div>
            </TiltCard>

            <TiltCard className="h-[450px] group bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent animate-pulse"></div>
                  <Layers size={48} className="text-purple-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">Adaptive Difficulty</h3>
                <p className="text-slate-300 leading-relaxed text-sm">Dynamic questioning engine that adjusts complexity in real-time based on your previous answers.</p>
                <div className="mt-auto w-full pt-6 border-t border-white/5">
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-3 transition-all">Challenge Mode <ArrowRight size={14} /></span>
                </div>
              </div>
            </TiltCard>

            <TiltCard className="h-[450px] group bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-8 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent animate-pulse"></div>
                  <Activity size={48} className="text-green-300 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">Real-time Feedback</h3>
                <p className="text-slate-300 leading-relaxed text-sm">Instant, granular analysis of your communication style, technical accuracy, and pacing.</p>
                <div className="mt-auto w-full pt-6 border-t border-white/5">
                  <span className="text-green-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-3 transition-all">View Analytics <ArrowRight size={14} /></span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        <div className="h-20"></div>
      </div>
    </div>
  );
};

const ProfileSetupView = ({ onComplete, user }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!name || !role || !experience) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    await onComplete({ name, role, experience, salary });
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto w-full p-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Let's Personalize Interaura</h2>
        <p className="text-slate-400 mt-2">Tell us about yourself to get better feedback.</p>
      </div>
      <Card className="w-full space-y-6">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Your Name</label>
          <Input icon={User} placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Target Job Role</label>
          <Input icon={Briefcase} placeholder="e.g., Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Years of Experience</label>
          <Input icon={Award} placeholder="e.g., 2" value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Salary Expectation (Optional)</label>
          <Input icon={Target} placeholder="e.g., $80,000" value={salary} onChange={(e) => setSalary(e.target.value)} />
        </div>
        <div className="pt-4">
          <Button className="w-full" onClick={handleComplete} icon={CheckCircle} disabled={loading}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </Card>
    </div>
  );
};


const ResumeUploadView = ({ onUpload, user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a resume file');
      return;
    }
    if (!targetRole) {
      alert('Please specify the target role');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', user.uid);
      formData.append('target_role', targetRole);

      const response = await fetch('http://localhost:8000/api/resume/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        onUpload(data.data);
      } else {
        alert('Failed to upload resume. Please try again.');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      alert('Error uploading resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-cyan-900/20 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-500 rounded-3xl mb-4 shadow-2xl shadow-purple-500/30 animate-float">
            <Upload size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200">
            Upload Your Resume
          </h1>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Get AI-powered insights and personalized interview questions tailored to your target role
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-6 space-y-5">
          {/* Target Role Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Briefcase size={14} className="text-cyan-400" />
              Target Role for Analysis
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="e.g., Frontend Engineer, Data Scientist, Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 text-sm"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
              We'll analyze your resume specifically for this role
            </p>
          </div>

          {/* File Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer group ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]' 
                : selectedFile 
                ? 'border-green-400 bg-green-500/10' 
                : 'border-slate-600 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && document.getElementById('resume-upload').click()}
          >
            {selectedFile ? (
              <div className="space-y-3 animate-fade-in">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-2xl">
                  <FileCheck size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{selectedFile.name}</p>
                  <p className="text-slate-400 text-xs mt-1">{(selectedFile.size / 1024).toFixed(2)} KB • PDF Document</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-200 text-xs font-medium"
                >
                  <X size={14} />
                  Remove File
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Upload size={24} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div>
                  <p className="text-white font-bold text-base mb-1">Drop your resume here</p>
                  <p className="text-slate-400 text-xs">or click to browse files</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-cyan-500/30 text-sm">
                  <Upload size={16} />
                  Choose PDF File
                </div>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                  PDF format only • Max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpload}
              disabled={loading || !selectedFile || !targetRole}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                loading || !selectedFile || !targetRole
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Upload & Analyze
                </>
              )}
            </button>

            <button
              onClick={() => onUpload({ skipped: true })}
              className="w-full py-2 text-slate-400 hover:text-slate-300 transition-colors text-xs font-medium flex items-center justify-center gap-2 group"
            >
              Skip for now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ onNavigate, userProfile, onLogout, interviewHistory = [] }) => {
  // Calculate real stats from interview history
  const totalInterviews = interviewHistory.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(interviewHistory.reduce((sum, i) => sum + (i.score || 0), 0) / totalInterviews) 
    : 0;
  
  // Calculate skill breakdown from real data (or show 0 if no interviews)
  const skillBreakdown = [
    { l: 'Technical', v: totalInterviews > 0 ? Math.round(avgScore * 0.95) : 0, c: 'bg-purple-500' },
    { l: 'Communication', v: totalInterviews > 0 ? Math.round(avgScore * 0.85) : 0, c: 'bg-cyan-500' },
    { l: 'Problem Solving', v: totalInterviews > 0 ? Math.round(avgScore * 0.9) : 0, c: 'bg-green-500' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  };

  return (
    <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Hello, {userProfile?.name || 'User'}</h2>
          <p className="text-slate-400 mt-1 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Ready to crush your next interview?</p>
        </div>
        <div className="flex gap-3">
          {totalInterviews > 0 && (
            <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-2 text-sm text-slate-300">
              <Flame size={16} className="text-orange-500" />
              <span className="font-bold text-white">{totalInterviews} Interviews</span>
            </div>
          )}
          <Button variant="secondary" icon={Upload} onClick={() => onNavigate('resume-upload')}>New Resume</Button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative group overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#0a0a1a] border border-slate-800 p-8 flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-[80px]"></div>
          <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-6 z-10">Interview Readiness</h3>
          <div className="relative w-64 h-64 flex items-center justify-center z-10">
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse-slow"></div>
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="110" stroke="#1e293b" strokeWidth="12" fill="transparent" />
              <circle 
                cx="128" 
                cy="128" 
                r="110" 
                stroke="url(#gradient)" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray="691" 
                strokeDashoffset={691 - (691 * avgScore) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out" 
              />
              <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-7xl font-black text-white tracking-tighter">{avgScore}<span className="text-3xl text-slate-500">%</span></span>
              {totalInterviews > 0 ? (
                <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 mt-2">
                  {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Keep practicing'}
                </span>
              ) : (
                <span className="text-slate-400 text-sm mt-2">No interviews yet</span>
              )}
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-6 text-center max-w-xs z-10">
            {totalInterviews > 0 
              ? `Based on ${totalInterviews} interview${totalInterviews > 1 ? 's' : ''}. Keep practicing to improve!`
              : 'Start your first mock interview to see your readiness score.'
            }
          </p>
        </div>

        <div onClick={() => onNavigate('interview-setup')} className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20">
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500">
            <Zap size={180} fill="white" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3">RECOMMENDED</div>
              <h3 className="text-3xl font-bold text-white mb-2">Start Mock Interview</h3>
              <p className="text-blue-100 max-w-sm">AI-driven session tailored to your role: {userProfile?.role || 'Software Engineer'}</p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-bold text-white group-hover:gap-4 transition-all">Begin Session <ArrowRight /></div>
          </div>
        </div>

        <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-300">Skill Breakdown</h4><BarChart size={18} className="text-purple-400" /></div>
          <div className="space-y-4">
            {skillBreakdown.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1 text-slate-400"><span>{s.l}</span><span>{s.v}%</span></div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${s.c} transition-all duration-500`} style={{ width: `${s.v}%` }}></div></div>
              </div>
            ))}
          </div>
          {totalInterviews === 0 && (
            <p className="text-xs text-slate-500 mt-4 text-center">Complete interviews to see your skill breakdown</p>
          )}
        </div>

        <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Clock size={16} /> Recent History</h4>
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
            {interviewHistory.length > 0 ? (
              interviewHistory.slice(0, 3).map((interview, idx) => (
                <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-slate-400">{interview.date || 'Recent'}</span>
                    <span className={`text-xs font-bold ${interview.score >= 80 ? 'text-green-400' : interview.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{interview.score}/100</span>
                  </div>
                  <div className="font-bold text-white text-sm">{interview.topic || 'Mock Interview'}</div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-4">
                <Clock size={24} className="text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No interviews yet</p>
                <p className="text-slate-600 text-xs">Start practicing to see your history</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { t: "Practice Interview", type: "Start Now", icon: Play, color: "text-cyan-400", bg: "bg-cyan-500/10", action: () => onNavigate('interview-setup') },
          { t: "Upload Resume", type: "ATS Analysis", icon: Upload, color: "text-purple-400", bg: "bg-purple-500/10", action: () => onNavigate('resume-upload') },
          { t: "View Progress", type: "Statistics", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", action: () => onNavigate('progress') },
          { t: "Resources", type: "Learning", icon: BookOpen, color: "text-yellow-400", bg: "bg-yellow-500/10", action: () => onNavigate('resources') }
        ].map((item, i) => (
          <div key={i} onClick={item.action} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group">
            <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><item.icon size={20} /></div>
            <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{item.t}</h4>
            <p className="text-xs text-slate-500">{item.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResumeInsightsView = ({ onContinue, resumeData }) => {
  const analysis = resumeData?.analysis || {};
  const score = analysis.overall_score || 0;
  
  return (
    <div className="h-full p-6 max-w-6xl mx-auto overflow-y-auto custom-scrollbar animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Resume Analysis</h2>
        <p className="text-slate-400">AI-powered insights for your target role</p>
      </div>

      {/* Overall Score */}
      <Card className="mb-6 text-center p-8" glow>
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke="url(#scoreGradient)" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * score) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000" 
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white">{score}</span>
              <span className="text-sm text-slate-400">Overall Score</span>
            </div>
          </div>
          <p className="text-slate-300 max-w-2xl">{analysis.summary || "Your resume has been analyzed successfully."}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {(analysis.strengths || []).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <Check size={16} className="text-green-400 mt-1 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Gaps */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Areas to Improve</h3>
          </div>
          <ul className="space-y-2">
            {(analysis.gaps || []).map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <AlertCircle size={16} className="text-orange-400 mt-1 flex-shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Suggestions */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Recommendations</h3>
        </div>
        <ul className="space-y-3">
          {(analysis.suggestions || []).map((suggestion, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyan-400">{idx + 1}</span>
              </div>
              <span className="text-slate-300">{suggestion}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Key Skills Found</h3>
          <div className="flex flex-wrap gap-2">
            {(analysis.key_skills_found || []).map((skill, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm border border-green-500/30">
                {skill}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Skills to Add</h3>
          <div className="flex flex-wrap gap-2">
            {(analysis.missing_skills || []).map((skill, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm border border-orange-500/30">
                {skill}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={onContinue} icon={ArrowRight} variant="primary">
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};


const InterviewSetupView = ({ onStart, userProfile }) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        if (userProfile.role) formData.append('role', userProfile.role);
        if (userProfile.experience) formData.append('experienceYears', userProfile.experience);
        
        const response = await fetch('http://localhost:8000/api/questions/generate', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setSelectedQuestion(data.questions[0]);
        } else {
          // Fallback to mock questions
          setQuestions(MOCK_QUESTIONS);
          setSelectedQuestion(MOCK_QUESTIONS[0]);
          setError('Using default questions');
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('Failed to load questions. Using defaults.');
        // Fallback to mock questions
        setQuestions(MOCK_QUESTIONS);
        setSelectedQuestion(MOCK_QUESTIONS[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [userProfile]);

  const handleStart = () => {
    if (selectedQuestion && questions.length > 0) {
      // Reorder questions to put selected one first
      const reorderedQuestions = [
        selectedQuestion,
        ...questions.filter(q => q !== selectedQuestion)
      ];
      onStart(reorderedQuestions);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in-up max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-2">Interview Setup</h2>
      <p className="text-slate-400 mb-8">Select a question to practice</p>

      {isLoading ? (
        <Card className="w-full">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-slate-400">Generating personalized questions...</p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {error && (
            <div className="w-full mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="w-full space-y-4 mb-8">
            {questions.map((q, idx) => (
              <Card
                key={idx}
                onClick={() => setSelectedQuestion(q)}
                className={`cursor-pointer transition-all ${
                  selectedQuestion === q ? 'border-cyan-500 bg-cyan-500/5' : 'hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedQuestion === q ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedQuestion === q ? <Check size={16} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        q.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-slate-500">{q.focus}</span>
                    </div>
                    <p className="text-white font-medium">{q.question}</p>
                    {q.topic && (
                      <p className="text-xs text-slate-500 mt-2">Topic: {q.topic}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={handleStart} icon={Play} disabled={!selectedQuestion}>
            Start Interview
          </Button>
        </>
      )}
    </div>
  );
};

// --- ACTIVE INTERVIEW VIEW (WITH CHAT & MIC LOGIC) ---
const ActiveInterviewView = ({ question, nextQuestion, onEndQuestion, userProfile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', text: question.question || question.text || "No question available" }]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Recording Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        const videoBlob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        audioChunksRef.current = [];

        const formData = new FormData();
        formData.append("file", videoBlob, "recording.webm");
        formData.append("questionId", question.id || "dynamic");
        formData.append("question", question.question || question.text || ""); // Send actual question text
        formData.append("role", userProfile.role || "candidate");
        
        // Add user profile data for enhanced evaluation
        if (userProfile.name) formData.append("candidateName", userProfile.name);
        if (userProfile.experience) formData.append("experienceYears", userProfile.experience);
        if (userProfile.salary) formData.append("salaryExpectation", userProfile.salary);

        try {
          const response = await fetch("http://localhost:8000/api/analyze", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Analysis failed");

          const data = await response.json();
          setMessages(prev => [...prev, { role: 'user', text: data.transcript || "(No speech detected)" }]);

          setTimeout(() => {
            const nextQuestionText = nextQuestion ? (nextQuestion.question || nextQuestion.text) : null;
            const message = nextQuestionText 
              ? `Great! Here's your next question:\n\n${nextQuestionText}\n\nClick Next when you're ready to see your analysis and continue.`
              : "Thank you! That was the last question. Click Next to see your final analysis.";
            setMessages(prev => [...prev, { role: 'ai', text: message }]);
          }, 1000);

          lastResultRef.current = data;

        } catch (error) {
          console.error("Error sending video:", error);
          setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I had trouble analyzing that. Please try again." }]);
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = null;
          }
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing camera/microphone:", err);
      alert("Could not access camera/microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const lastResultRef = useRef(null);

  const handleNextClick = () => {
    if (lastResultRef.current) {
      onEndQuestion(lastResultRef.current);
    } else {
      onEndQuestion(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex h-full animate-fade-in-up">
      <div className="w-1/3 border-r border-slate-800 p-8 flex flex-col items-center justify-center bg-slate-900/30">
        <div className="relative mb-8 w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-2xl">
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-30 grayscale'}`}
          />
          {!isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse-slow">
                <Video size={32} className="text-cyan-400 opacity-50" />
              </div>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-2 py-1 rounded-md backdrop-blur-md">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-red-400">REC</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-white font-bold text-lg mb-1">AI Interviewer</h3>
          <p className="text-cyan-400 text-sm font-mono">{isRecording ? "ANALYZING VISUALS..." : isProcessing ? "UPLOADING..." : "READY"}</p>
        </div>
      </div>

      <div className="w-2/3 flex flex-col bg-slate-950">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none border border-slate-700 p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        <div className="h-32 border-t border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? <Square fill="white" size={20} /> : <Mic fill="white" size={24} />}
            </button>
            <div>
              <div className="text-white font-mono text-xl font-bold">{formatTime(timer)}</div>
              <div className="h-4 w-32 mt-1"><AudioVisualizer isActive={isRecording} /></div>
            </div>
          </div>
          <Button variant="secondary" onClick={handleNextClick} icon={ArrowRight}>Next</Button>
        </div>
      </div>
    </div>
  );
};

const InstantFeedbackView = ({ onNext, data, nextQuestion }) => {
  // Parsing Data with Fallbacks
  const transcript = data?.transcript || "No speech detected.";
  const overallScore = data?.overallScore || 0;

  // Scores - check both 'content' and 'evaluation' keys for compatibility
  const visualScore = data?.visual ? Math.round((data.visual.eyeContact + data.visual.posture) / 2) : 0;
  const contentData = data?.content || data?.evaluation || {};
  const contentScore = contentData.score ? Math.round(contentData.score * 10) : 0; // Convert 1-10 to percentage
  const speechScore = data?.speechScore || 0;

  // Metrics
  const wpm = data?.speech?.wordsPerMinute || 0;
  const fillerCount = data?.speech?.fillerCount || 0;
  const eyeContact = data?.visual?.eyeContact || 0;
  const posture = data?.visual?.posture || 0;
  
  // Enhanced feedback from LLM
  const contentFeedback = contentData.feedback || contentData.reasoning || "Keep practicing!";
  const confidenceAssessment = contentData.confidence_assessment || "";
  const communicationQuality = contentData.communication_quality || "";

  return (
    <div className="flex h-full animate-fade-in-up">
      {/* Left Sidebar - Compact Metrics */}
      <div className="w-80 border-r border-slate-800 p-6 flex flex-col bg-slate-900/30 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Analysis Results</h2>
          <p className="text-slate-400 text-sm">Performance breakdown</p>
        </div>

        {/* Overall Score */}
        <div className="mb-6 p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
          <div className="text-center">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-1">{overallScore}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</div>
          </div>
        </div>

        {/* Compact Metric Cards */}
        <div className="space-y-3 mb-6">
          {/* Visual */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-cyan-400" />
                <span className="text-xs font-bold text-slate-300 uppercase">Visual</span>
              </div>
              <span className={`text-lg font-bold ${visualScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>{visualScore}%</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Eye Contact</span>
                  <span>{eyeContact}%</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${eyeContact}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Posture</span>
                  <span>{posture}%</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${posture}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-slate-300 uppercase">Content</span>
              </div>
              <span className={`text-lg font-bold ${contentScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>{contentScore}%</span>
            </div>
          </div>

          {/* Speech */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mic size={14} className="text-green-400" />
                <span className="text-xs font-bold text-slate-300 uppercase">Speech</span>
              </div>
              <span className={`text-lg font-bold ${speechScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>{speechScore.toFixed(0)}%</span>
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-base font-bold text-white">{wpm}</div>
                <div className="text-[9px] text-slate-500 uppercase">WPM</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-700"></div>
              <div className="text-center">
                <div className={`text-base font-bold ${fillerCount > 3 ? 'text-red-400' : 'text-green-400'}`}>{fillerCount}</div>
                <div className="text-[9px] text-slate-500 uppercase">Fillers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Question Preview */}
        {nextQuestion && (
          <div className="mt-auto pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Next Question</p>
            <p className="text-sm text-slate-300 leading-snug">{nextQuestion.question || nextQuestion.text}</p>
            <Button onClick={onNext} icon={ArrowRight} className="w-full mt-3" variant="primary">
              Continue
            </Button>
          </div>
        )}
        {!nextQuestion && (
          <Button onClick={onNext} icon={CheckCircle} className="w-full mt-auto" variant="success">
            Complete Interview
          </Button>
        )}
      </div>

      {/* Right Side - Expanded AI Analysis */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {/* AI Evaluation */}
        <Card className="mb-6">
          <h3 className="text-slate-300 text-xl font-bold mb-4 flex items-center gap-2">
            <Brain size={24} className="text-cyan-400" />
            AI Evaluation
          </h3>
          <p className="text-slate-200 text-base leading-relaxed mb-4 italic">"{contentFeedback}"</p>
          {confidenceAssessment && (
            <div className="p-3 bg-slate-800/30 rounded-lg mb-2">
              <p className="text-xs text-slate-400"><strong className="text-cyan-400">Confidence:</strong> {confidenceAssessment}</p>
            </div>
          )}
          {communicationQuality && (
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <p className="text-xs text-slate-400"><strong className="text-purple-400">Communication:</strong> {communicationQuality}</p>
            </div>
          )}
        </Card>

        {/* Enhanced AI Suggestions Section */}
        {contentData.suggestions && contentData.suggestions.length > 0 && (
          <Card className="mb-6">
            <h3 className="text-slate-300 text-xl font-bold mb-4 flex items-center gap-2">
              <Target size={24} className="text-green-400" />
              Specific Improvements
            </h3>
            <div className="space-y-4">
              {contentData.suggestions.map((suggestion, idx) => {
                const isEnhanced = typeof suggestion === 'object';
                const improvement = isEnhanced ? suggestion.improvement : suggestion;
                const context = isEnhanced ? suggestion.context : null;
                const betterApproach = isEnhanced ? suggestion.better_approach : null;
                
                return (
                  <div key={idx} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-3 text-base">{improvement}</p>
                        {context && context !== 'General' && (
                          <div className="mb-3 p-3 bg-slate-900/50 rounded border-l-2 border-cyan-500/50">
                            <p className="text-xs text-slate-400 mb-1">In your response:</p>
                            <p className="text-sm text-slate-300 italic">"{context}"</p>
                          </div>
                        )}
                        {betterApproach && (
                          <div className="p-3 bg-green-500/10 rounded border-l-2 border-green-500/50">
                            <p className="text-xs text-green-400 mb-1 font-semibold">Better approach:</p>
                            <p className="text-sm text-slate-200">{betterApproach}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Behavioral Insights Section */}
        {contentData.behavioral_insights && (
          <Card className="mb-6">
            <h3 className="text-slate-300 text-xl font-bold mb-4 flex items-center gap-2">
              <Activity size={24} className="text-purple-400" />
              Behavioral Insights
            </h3>
            <div className="space-y-3">
              {contentData.behavioral_insights.eye_contact_analysis && (
                <div className="p-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={18} className="text-cyan-400" />
                    <h4 className="text-sm font-bold text-slate-200">Eye Contact Pattern</h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{contentData.behavioral_insights.eye_contact_analysis}</p>
                </div>
              )}
              {contentData.behavioral_insights.filler_word_impact && (
                <div className="p-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume size={18} className="text-orange-400" />
                    <h4 className="text-sm font-bold text-slate-200">Filler Word Analysis</h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{contentData.behavioral_insights.filler_word_impact}</p>
                </div>
              )}
              {contentData.behavioral_insights.speech_pace_feedback && (
                <div className="p-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={18} className="text-green-400" />
                    <h4 className="text-sm font-bold text-slate-200">Speech Pace</h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{contentData.behavioral_insights.speech_pace_feedback}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Transcript */}
        <Card>
          <h3 className="text-slate-300 text-lg font-bold mb-3 flex items-center gap-2">
            <FileText size={20} className="text-slate-400" />
            Your Response
          </h3>
          <p className="text-slate-200 text-base leading-relaxed p-4 bg-slate-900/30 rounded-xl">
            "{transcript}"
          </p>
        </Card>
      </div>
    </div>
  );
};

const PracticeHubView = () => (
  <div className="h-full p-6 animate-fade-in-up"><h2 className="text-3xl font-bold text-white">Practice Hub</h2></div>
);

const ProgressView = () => (
  <div className="h-full p-6 animate-fade-in-up"><h2 className="text-3xl font-bold text-white">Progress</h2></div>
);

const Sidebar = ({ setView }) => (
  <div className="hidden md:flex flex-col w-64 bg-[#050510] border-r border-slate-800 h-full p-6">
    <div className="text-xl font-bold text-white mb-10 flex items-center gap-2">
      <Zap className="text-cyan-400" size={24} fill="currentColor" /> INTERAURA
    </div>
    <div className="space-y-2">
      <button onClick={() => setView('dashboard')} className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white flex gap-3 items-center font-medium border border-white/5"><LayoutGrid size={20} /> Dashboard</button>
      <button onClick={() => setView('resources')} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 flex gap-3 items-center transition-all"><BookOpen size={20} /> Practice</button>
      <button onClick={() => setView('progress')} className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 flex gap-3 items-center transition-all"><TrendingUp size={20} /> Progress</button>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState('landing');
  const [qIndex, setQIndex] = useState(0);
  const [feedbackData, setFeedbackData] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(MOCK_QUESTIONS);
  const [user, setUser] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: '',
    role: '',
    experience: '',
    salary: ''
  });

  // Check for existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check if profile is complete
      if (userData.profile_completed) {
        setUserProfile({
          name: userData.name || '',
          role: userData.role || '',
          experience: userData.experience_years || '',
          salary: userData.salary_expectation || ''
        });
        
        // Go directly to dashboard (resume upload is optional)
        setView('dashboard');
      } else {
        setView('profile-setup');
      }
    }
  }, []);

  const handleAuthComplete = (userData) => {
    setUser(userData);
    
    // If user has profile data, they're an existing user - go to dashboard
    // If no profile data, they're a new user - go to profile setup
    if (userData.name || userData.profile_completed) {
      // Existing user with profile - go to dashboard
      setUserProfile({
        name: userData.name || '',
        role: userData.role || '',
        experience: userData.experience_years || '',
        salary: userData.salary_expectation || ''
      });
      setView('dashboard');
    } else {
      // New user - needs profile setup
      setView('profile-setup');
    }
  };

  const handleProfileComplete = async (profileData) => {
    try {
      // Save profile to backend
      const formData = new FormData();
      formData.append('user_id', user.uid);
      formData.append('name', profileData.name);
      formData.append('role', profileData.role);
      formData.append('experienceYears', profileData.experience);
      formData.append('salaryExpectation', profileData.salary);

      const response = await fetch('http://localhost:8000/api/profile/update', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setUserProfile(profileData);
        
        // Update user object
        const updatedUser = {
          ...user,
          name: profileData.name,
          role: profileData.role,
          experience_years: profileData.experience,
          salary_expectation: profileData.salary,
          profile_completed: true
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Go directly to dashboard (resume upload is optional)
        setView('dashboard');
      } else {
        console.error('Failed to save profile:', data);
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  const handleProfileUpdate = (profile) => setUserProfile(profile);
  const handleResumeUploaded = (resumeDataParam) => {
    // Store resume data
    setResumeData(resumeDataParam);
    
    // Update user object with resume status
    const updatedUser = {
      ...user,
      resume_uploaded: true
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setView('resume-insights');
  };
  const handleBeginInterview = (questions) => { 
    if (questions && questions.length > 0) {
      setSelectedQuestions(questions);
    }
    setQIndex(0); 
    setView('interview-active'); 
  };

  const handleQuestionDone = (data) => {
    setFeedbackData(data);
    
    // Save to interview history for statistics
    if (data && data.overall_score) {
      const newInterviewEntry = {
        score: data.overall_score * 10, // Convert 1-10 to 0-100
        topic: selectedQuestions[qIndex]?.topic || 'Mock Interview',
        date: new Date().toLocaleDateString()
      };
      setInterviewHistory(prev => [newInterviewEntry, ...prev]);
    }
    
    setView('interview-feedback');
  };
  
  const handleNextQuestion = () => {
    // Move to next question
    const nextIndex = qIndex + 1;
    if (nextIndex < selectedQuestions.length) {
      setQIndex(nextIndex);
      setView('interview-active');
    } else {
      setView('post-interview');
    }
  };

  const showSidebar = ['dashboard', 'resources', 'progress'].includes(view);

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {showSidebar && <Sidebar setView={setView} />}
      <main className="flex-grow h-full relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 h-full">
          {view === 'landing' && <LandingView onStart={() => setView('auth')} />}
          {view === 'auth' && <AuthView onAuthComplete={handleAuthComplete} />}
          {view === 'profile-setup' && <ProfileSetupView onComplete={handleProfileComplete} user={user} />}
          {view === 'dashboard' && <DashboardView onNavigate={setView} userProfile={userProfile} onLogout={() => { setUser(null); setView('landing'); }} interviewHistory={interviewHistory} />}
          {view === 'resume-upload' && <ResumeUploadView onUpload={handleResumeUploaded} user={user} />}
          {view === 'resume-insights' && <ResumeInsightsView onContinue={() => setView('dashboard')} resumeData={resumeData} />}
          {view === 'interview-setup' && <InterviewSetupView onStart={handleBeginInterview} userProfile={userProfile} />}
          {view === 'interview-active' && <ActiveInterviewView question={selectedQuestions[qIndex]} nextQuestion={qIndex < selectedQuestions.length - 1 ? selectedQuestions[qIndex + 1] : null} onEndQuestion={handleQuestionDone} userProfile={userProfile} />}
          {view === 'interview-feedback' && <InstantFeedbackView onNext={handleNextQuestion} data={feedbackData} nextQuestion={qIndex < selectedQuestions.length - 1 ? selectedQuestions[qIndex + 1] : null} />}
          {view === 'post-interview' && <PostInterviewView onHome={() => setView('dashboard')} />}
          {view === 'resources' && <PracticeHubView />}
          {view === 'progress' && <ProgressView />}
        </div>
      </main>
      <style>{`
        /* ... existing styles ... */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.1); } }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }

        @keyframes typewriter { from { width: 0; border-color: transparent; } to { width: 100%; border-color: #06b6d4; } }
        .animate-typewriter { animation: typewriter 3s steps(40) forwards; }
        
        @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        .animate-blink { animation: blink 3s infinite; }

        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }

        @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 2s linear infinite; }
        
        @keyframes scan-overlay { 0% { height: 0%; opacity: 0; } 50% { opacity: 1; } 100% { height: 100%; opacity: 0; } }
        .animate-scan-overlay { animation: scan-overlay 2s linear infinite; }

        @keyframes scale-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1s; opacity: 0; }

        @keyframes draw-path { to { stroke-dashoffset: 0; } }
        .animate-draw-path { animation: draw-path 2s ease-out forwards; }

        @keyframes fade-in-delayed { to { opacity: 1; } }
        .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out forwards 1.5s; }

        @keyframes shine { 100% { transform: translateX(150%) skewX(12deg); } }
        .animate-shine { animation: shine 3s infinite; }

        @keyframes gradient-x {
           0% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
           100% { background-position: 0% 50%; }
        }
        .animate-gradient-x { animation: gradient-x 6s ease infinite; }

        @keyframes shine-slow { 0% { opacity: 0.2; } 50% { opacity: 0.4; } 100% { opacity: 0.2; } }
        .animate-shine-slow { animation: shine-slow 3s infinite; }

        @keyframes pop-in { 0% { transform: scale(0); } 100% { transform: scale(1); } }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1.5s; }

        @keyframes ping-slow { 75%, 100% { transform: scale(2); opacity: 0; } }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-slow 12s ease-in-out infinite 2s; }
        
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 60s linear infinite; }
        
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default App;