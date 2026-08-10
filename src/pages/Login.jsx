import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://localhost:44338/api/auth/login",
        {
          email: email,
          password: password,
        },
      );

      const token = response.data.token;
      const userRole = response.data.userRole;

      localStorage.setItem("token", token);

      if (userRole === "Admin") {
        navigate("/admin");
      } else if (userRole === "User") {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Incorrect email or password.");
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-urbanist">
      {/* 1. Left Section: Branding & Marketing (Hidden on mobile, visible on large screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 p-12 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.15),transparent_50%)]" />

        <div className="relative z-10 flex items-center gap-3">
          {/* Thêm bg-white, rounded-full và shadow-sm giúp logo nổi bật hơn */}
          <div className="bg-white p-2 rounded-full flex items-center justify-center shadow-sm">
            <img
              className="w-10 h-10 rounded-full object-contain"
              src="/paypal.png"
              alt="Logo"
            />
          </div>
          <span className="text-3xl font-bold tracking-tight">ePriTracker</span>
        </div>

        {/* <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Intelligent Price Tracking for Enterprise
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Track, analyze, and update market price fluctuations in real-time.
            Optimize your profit margins today.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Enterprise-grade data security</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Lightning-fast automated price updates</span>
            </div>
          </div>
        </div> */}

        <div className="font-syne text-4xl text-center">
          <p>on working ... </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} ePriTracker. All rights reserved.
        </div>
      </div>

      {/* 2. Right Section: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          {/* Header Form */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Better UX Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-200 text-red-600 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all duration-200"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded cursor-pointer focus:ring-indigo-600 focus:ring-offset-0"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            {/* Footer / Trusted by */}
          </form>
        </div>
      </div>
    </div>
  );
}
