import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const DashboardPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Uses axios with JWT auth automatically attached
        const response = await api.getModelHistory();
        setModels(response.data.history || []);
      } catch (err) {
        setError('Could not load model history. Please try again.');
        console.error('Failed to load models:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const getPrimaryScore = (m) => {
    if (!m.metrics) return '—';
    if (m.metrics.accuracy !== undefined) return `${(m.metrics.accuracy * 100).toFixed(2)}% acc`;
    if (m.metrics.r2 !== undefined) return `${parseFloat(m.metrics.r2).toFixed(4)} R²`;
    return '—';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a1f36] tracking-tight">Model Dashboard</h1>
          <p className="text-[#4f566b] mt-2 text-lg">Your personal workspace of trained models.</p>
        </div>
        <Link
          to="/upload"
          className="btn-primary px-6 py-3 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap text-base"
        >
          <span>Train New Model</span>
          <span>🚀</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-20">
          <div className="saas-spinner w-10 h-10 border-4 border-t-[#635bff] border-[#635bff]/20"></div>
        </div>
      ) : error ? (
        <div className="saas-card p-10 text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      ) : models.length === 0 ? (
        <div className="saas-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#f7f9fc] flex items-center justify-center text-[#8792a2] mb-4 border border-[#e3e8ee]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1a1f36] mb-2">No models trained yet</h2>
          <p className="text-[#4f566b] max-w-md mx-auto mb-6">
            You haven't trained any models yet. Upload a dataset to get started with zero-code machine learning.
          </p>
          <button onClick={() => navigate('/upload')} className="btn-primary px-6 py-2">
            Start First Project
          </button>
        </div>
      ) : (
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white border-none">
              <thead className="bg-[#f7f9fc] border-b border-[#e3e8ee]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-[#4f566b] text-xs uppercase tracking-wider">Model</th>
                  <th className="py-4 px-6 font-semibold text-[#4f566b] text-xs uppercase tracking-wider">Target Column</th>
                  <th className="py-4 px-6 font-semibold text-[#4f566b] text-xs uppercase tracking-wider text-right">Score</th>
                  <th className="py-4 px-6 font-semibold text-[#4f566b] text-xs uppercase tracking-wider text-right">Trained On</th>
                  <th className="py-4 px-6 font-semibold text-[#4f566b] text-xs uppercase tracking-wider">Params</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f7f9fc] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#1a1f36]">{m.model_name}</div>
                      <div className="text-xs text-[#8792a2] mt-1 truncate max-w-[160px]" title={m.id}>
                        {m.id?.slice(0, 8)}…
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#4f566b]">{m.target_column}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-[#0e6245] bg-[#e0f2f1] px-2.5 py-1 rounded-md text-sm border border-[#a7f3d0]">
                        {getPrimaryScore(m)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-[#4f566b] whitespace-nowrap">
                      {formatDate(m.timestamp)}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#8792a2]">
                      {m.parameters ? Object.entries(m.parameters).map(([k, v]) => (
                        <span key={k} className="inline-block bg-[#f7f9fc] border border-[#e3e8ee] rounded px-1.5 py-0.5 mr-1 mb-1">
                          {k}: {String(v)}
                        </span>
                      )) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-[#f7f9fc] border-t border-[#e3e8ee] text-xs text-[#8792a2]">
            Showing {models.length} model{models.length !== 1 ? 's' : ''} · Only your models are shown
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
