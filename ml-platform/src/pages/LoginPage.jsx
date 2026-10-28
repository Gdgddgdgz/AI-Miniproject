import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const LoginPage = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [infoMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.login(username, password);
      if (response.data?.access_token) {
        login(response.data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 animate-slide-up">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#635bff] text-white shadow-lg mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a1f36] tracking-tight">Welcome back</h1>
          <p className="text-[#4f566b] mt-2">Sign in to your AutoML Studio account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e3e8ee] p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {infoMessage && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm p-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {infoMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#1a1f36] mb-2 uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-[#635bff]/20 focus:border-[#635bff] transition-all"
                placeholder="your-username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1a1f36] mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-[#635bff]/20 focus:border-[#635bff] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-bold shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : 'Sign In'}
            </button>

            {/* Quick Demo Credentials Card */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#4f566b]">
              <div>
                <span className="font-bold text-[#1a1f36]">Demo Login:</span>{' '}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#e2e8f0] text-[#635bff]">admin</span> /{' '}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#e2e8f0] text-[#635bff]">admin</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin');
                }}
                className="font-bold text-[#635bff] hover:text-[#4338ca] bg-white hover:bg-[#ede9fe] px-2.5 py-1 rounded-lg border border-[#c7d2fe] transition-colors shadow-xs"
              >
                Auto-fill ⚡
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-[#e3e8ee] text-center">
            <p className="text-sm text-[#4f566b]">
              New to AutoML Studio?{' '}
              <Link to="/signup" className="text-[#635bff] font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
