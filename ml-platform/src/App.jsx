import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import UploadPage from './pages/UploadPage';
import LandingPage from './pages/LandingPage';
import ConfigPage from './pages/ConfigPage';
import DashboardPage from './pages/DashboardPage';
import DocsPage from './pages/DocsPage';
import AboutPage from './pages/AboutPage';
import TrainingPage from './pages/TrainingPage';
import ResultsDashboard from './pages/ResultsDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    return (
        <header className="bg-white border-b border-[#e3e8ee] sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded bg-[#635bff] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <span className="font-semibold text-lg tracking-tight text-[#1a1f36]">
                  AutoML <span className="text-[#4f566b] font-normal">Studio</span>
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4f566b]">
                <Link to="/" className="hover:text-[#1a1f36] transition-colors">Home</Link>
                {isAuthenticated && <Link to="/dashboard" className="hover:text-[#1a1f36] transition-colors">Dashboard</Link>}
                <Link to="/docs" className="hover:text-[#1a1f36] transition-colors">Docs</Link>
                <Link to="/about" className="hover:text-[#1a1f36] transition-colors">About</Link>
              </nav>

              <div className="flex items-center gap-4 text-sm font-medium">
                {isAuthenticated ? (
              <>
                <Link to="/upload" className="nav-link font-bold text-[#635bff] hover:text-[#00d4ff] transition-colors">Upload</Link>
                <Link to="/dashboard" className="nav-link font-bold text-[#635bff] hover:text-[#00d4ff] transition-colors">Dashboard</Link>
                <button 
                  onClick={logout}
                  className="px-5 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  Logout
                </button>
              </>
                ) : (
                    <Link to="/login" className="btn-primary px-6 py-2 shadow-sm">
                        Sign In
                    </Link>
                )}
              </div>
            </div>
          </header>
    );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-[#f7f9fc] flex flex-col">
            <Navbar />

            <main className="flex-1 w-full flex flex-col items-center animate-slide-up">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                <Route path="/upload" element={<ProtectedRoute><div className="w-full flex flex-col items-center pt-10 px-4 sm:px-6 pb-16"><UploadPage /></div></ProtectedRoute>} />
                <Route path="/config" element={<ProtectedRoute><div className="w-full flex flex-col items-center pt-10 px-4 sm:px-6 pb-16"><ConfigPage /></div></ProtectedRoute>} />
                <Route path="/training" element={<ProtectedRoute><div className="w-full flex flex-col items-center pt-10 px-4 sm:px-6 pb-16"><TrainingPage /></div></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute><div className="w-full flex flex-col items-center pt-10 px-4 sm:px-6 pb-16"><ResultsDashboard /></div></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><div className="w-full flex flex-col items-center"><DashboardPage /></div></ProtectedRoute>} />
                
                <Route path="/docs" element={<div className="w-full flex flex-col items-center"><DocsPage /></div>} />
                <Route path="/about" element={<div className="w-full flex flex-col items-center"><AboutPage /></div>} />
              </Routes>
            </main>
            
            <footer className="mt-auto py-8 bg-white border-t border-[#e3e8ee] w-full text-center text-sm text-[#8792a2]">
              <p>© 2024 AutoML Studio. From Data to Insights in Minutes.</p>
            </footer>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
