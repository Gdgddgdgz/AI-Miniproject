import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-4rem)] bg-white overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#e0e7ff] rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ede9fe] rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#dbeafe] rounded-full blur-[80px] opacity-50 animate-bounce" style={{ animationDuration: '15s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center animate-slide-up flex flex-col items-center pt-20 pb-24">
        {/* Startup Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#635bff] text-sm font-medium mb-8 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#635bff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#635bff]"></span>
          </span>
          AutoML Studio – Train, Compare & Deploy ML Models Instantly
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#1a1f36] tracking-tight leading-tight mb-6">
          Build Machine Learning <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635bff] to-[#00d4ff]">
            Models Without Writing Code
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-[#4f566b] max-w-2xl mx-auto mb-10 leading-relaxed">
          From data upload to model evaluation — everything in one place. <br className="hidden sm:block" />
          <span className="font-semibold text-[#1a1f36]">From Data to Insights in Minutes.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link to="/upload" className="w-full sm:w-auto px-8 py-4 bg-[#635bff] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(99,91,255,0.39)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.23)] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2">
            Upload Dataset <span className="text-xl">🚀</span>
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-[#1a1f36] border border-[#e3e8ee] rounded-xl font-bold text-lg hover:bg-[#f7f9fc] hover:border-[#d1d5db] transition-all duration-200 shadow-sm">
            View Demo
          </button>
        </div>
        
        {/* Visual Mockup Area */}
        <div className="mt-16 sm:mt-24 w-full max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#635bff] to-[#00d4ff] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl border border-[#e3e8ee] shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
            {/* Fake Browser Top */}
            <div className="h-10 bg-[#f7f9fc] border-b border-[#e3e8ee] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 flex-1">
                <div className="h-5 bg-white rounded border border-[#e3e8ee] max-w-sm w-full mx-auto shadow-sm flex items-center justify-center">
                  <span className="text-[10px] text-[#8792a2]">automl-studio.app</span>
                </div>
              </div>
            </div>
            {/* Fake Content area */}
            <div className="p-4 sm:p-8 aspect-video flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
              {/* Mock App Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <div className="h-5 sm:h-6 w-32 sm:w-48 bg-[#e2e8f0] rounded-md mb-2"></div>
                  <div className="h-3 sm:h-4 w-24 sm:w-32 bg-[#e2e8f0] rounded-md opacity-70"></div>
                </div>
                <div className="hidden sm:block h-10 w-32 bg-[#635bff] rounded-lg shadow-sm opacity-90"></div>
              </div>

              {/* Mock Stats Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-[#e2e8f0] p-2 sm:p-4 flex flex-col justify-center animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
                    <div className="h-2 sm:h-3 w-12 sm:w-16 bg-[#f1f5f9] rounded mb-2 sm:mb-3"></div>
                    <div className="h-4 sm:h-8 w-16 sm:w-24 bg-[#e2e8f0] rounded"></div>
                  </div>
                ))}
              </div>

              {/* Mock Main Content Area */}
              <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 min-h-0">
                {/* Left Chart Area */}
                <div className="flex-[2] bg-white rounded-lg sm:rounded-xl shadow-sm border border-[#e2e8f0] p-3 sm:p-5 flex flex-col">
                  <div className="h-3 sm:h-4 w-24 sm:w-32 bg-[#f1f5f9] rounded mb-4 sm:mb-6"></div>
                  <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2">
                    {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85].map((height, idx) => (
                      <div key={idx} className="w-full bg-gradient-to-t from-[#635bff] to-[#00d4ff] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer animate-slide-up" style={{ height: `${height}%`, animationDelay: `${idx * 50}ms` }}></div>
                    ))}
                  </div>
                </div>
                {/* Right Side Panel */}
                <div className="flex-1 flex flex-row sm:flex-col gap-4">
                  <div className="flex-1 bg-white rounded-lg sm:rounded-xl shadow-sm border border-[#e2e8f0] p-3 sm:p-4 hidden md:flex flex-col">
                    <div className="h-3 sm:h-4 w-20 sm:w-24 bg-[#f1f5f9] rounded mb-3 sm:mb-4"></div>
                    <div className="space-y-2 sm:space-y-3 flex-1">
                      <div className="h-2 sm:h-3 w-full bg-[#e2e8f0] rounded"></div>
                      <div className="h-2 sm:h-3 w-4/5 bg-[#e2e8f0] rounded"></div>
                      <div className="h-2 sm:h-3 w-full bg-[#f1f5f9] rounded"></div>
                      <div className="h-2 sm:h-3 w-2/3 bg-[#e2e8f0] rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#635bff] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                    <div className="h-3 w-16 sm:w-24 bg-white/40 rounded mb-2 sm:mb-4"></div>
                    <div className="h-6 sm:h-8 w-24 sm:w-32 bg-white rounded mb-1 sm:mb-2"></div>
                    <div className="h-2 sm:h-3 w-16 sm:w-20 bg-white/60 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
