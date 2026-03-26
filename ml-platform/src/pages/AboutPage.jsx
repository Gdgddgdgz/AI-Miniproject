import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="w-full bg-[#f7f9fc] min-h-screen pt-20 pb-24 animate-slide-up">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#635bff]/10 to-[#00d4ff]/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#e3e8ee] flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0 duration-300">
          <svg className="w-10 h-10 text-[#635bff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-[#1a1f36] tracking-tight leading-tight mb-6">
          Architected by <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635bff] to-[#00d4ff]">
            Awwab
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-[#4f566b] leading-relaxed max-w-2xl mx-auto font-medium mb-12">
          AutoML Studio is a completely proprietary, advanced Data Science platform built from the ground up to democratize machine learning for everyone.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 mb-20 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e3e8ee] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-xl mb-6">⚡</div>
            <h3 className="text-xl font-bold text-[#1a1f36] mb-3">Custom Architecture</h3>
            <p className="text-[#4f566b] leading-relaxed text-sm">Every element of this platform, from the React interface algorithms to the FastAPI training tournament structure, was meticulously coded by Awwab to ensure perfectly optimized execution times.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e3e8ee] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-xl mb-6">🧠</div>
            <h3 className="text-xl font-bold text-[#1a1f36] mb-3">Intelligent System</h3>
            <p className="text-[#4f566b] leading-relaxed text-sm">The platform boasts an exclusive engine that automatically handles Null Imputation, Model Ranking, Type Detection, and Model Cross-Validation completely dynamically.</p>
          </div>
        </div>

        {/* Final CTA Strip */}
        <div className="bg-white rounded-3xl p-10 border border-[#e3e8ee] shadow-sm max-w-3xl mx-auto text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#635bff]/10 to-transparent rounded-bl-[100px]"></div>
          <h2 className="text-2xl font-bold text-[#1a1f36] mb-4 relative z-10">Experience the difference.</h2>
          <p className="text-[#4f566b] mb-8 relative z-10">Stop writing redundant boilerplate. Start deriving data insights.</p>
          <Link to="/upload" className="btn-primary px-8 py-3.5 text-lg inline-flex shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] hover:-translate-y-1 transition-all duration-200 gap-2 relative z-10 font-bold">
            Train A Model 🚀
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
