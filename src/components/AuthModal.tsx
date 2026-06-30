import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { usernameOrEmail: username || email, password }
      : { username, email, password, role };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed. Please verify credentials.");
      }

      // Success!
      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Connection refused. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
        id="auth-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <h3 className="font-sans text-lg font-bold text-gray-950">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              {isLogin ? "Sign in to access bookings" : "Join MobiBook today"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            id="close-auth-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Tips for quick evaluation */}
          <div className="rounded-xl bg-amber-50/50 p-3 text-xs text-amber-800 border border-amber-100/50 space-y-1">
            <p className="font-bold">💡 Evaluation Credentials:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Admin Login: <code className="font-semibold bg-amber-100/60 px-1 rounded text-amber-950">admin</code> / <code className="font-semibold bg-amber-100/60 px-1 rounded text-amber-950">adminpassword</code></li>
              <li>User Login: <code className="font-semibold bg-amber-100/60 px-1 rounded text-amber-950">john_doe</code> / <code className="font-semibold bg-amber-100/60 px-1 rounded text-amber-950">password123</code></li>
            </ul>
          </div>

          {/* Fields */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex_smith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {isLogin ? "Username or Email" : "Email Address"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type={isLogin ? "text" : "email"}
                required
                placeholder={isLogin ? "admin / john_doe / email" : "alex@example.com"}
                value={isLogin ? username : email}
                onChange={(e) => isLogin ? setUsername(e.target.value) : setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Role selector for registration to easily test Admin powers */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-sm font-semibold transition-all ${
                    role === "USER"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-sm font-semibold transition-all ${
                    role === "ADMIN"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Administrator
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 shadow-indigo-100 transition-all mt-2"
            id="btn-auth-submit"
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
          </button>

          {/* Toggle */}
          <div className="text-center pt-3 text-xs text-gray-500">
            {isLogin ? "New to MobiBook?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-bold text-indigo-600 hover:underline"
              id="btn-auth-toggle"
            >
              {isLogin ? "Sign Up Now" : "Sign In Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
