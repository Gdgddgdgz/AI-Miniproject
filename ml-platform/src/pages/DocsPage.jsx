import React from 'react';

const DocsPage = () => {
  return (
    <div className="w-full bg-[#f7f9fc] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row gap-8 animate-slide-up">
        
        {/* Sidebar */}
        <div className="w-full md:w-72 shrink-0 hidden md:block">
          <div className="sticky top-24 bg-white rounded-xl border border-[#e3e8ee] p-6 shadow-sm">
            <h3 className="text-xs font-black text-[#8792a2] uppercase tracking-[0.1em] mb-4">Table of Contents</h3>
            <ul className="space-y-4 text-sm font-semibold text-[#4f566b]">
              <li><a href="#introduction" className="hover:text-[#635bff] transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee] group-hover:bg-[#635bff]"></div>Introduction</a></li>
              <li><a href="#upload-data" className="hover:text-[#635bff] transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]"></div>Data Upload Rules</a></li>
              <li><a href="#preprocessing" className="hover:text-[#635bff] transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]"></div>Data Preprocessing</a></li>
              <li><a href="#algorithms" className="hover:text-[#635bff] transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]"></div>Supported Algorithms</a></li>
              <li><a href="#evaluation" className="hover:text-[#635bff] transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]"></div>Interpreting Results</a></li>
              <li><a href="#export" className="hover:text-[#635bff] transition-colors flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]"></div>Export & Deployment</a></li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-[#e3e8ee] shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#635bff] px-10 py-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <h1 className="text-4xl font-extrabold mb-4 relative z-10">Platform Documentation</h1>
            <p className="text-lg text-white/80 max-w-2xl relative z-10">
              The complete manual on how to train, evaluate, and deploy machine learning models through AutoML Studio without a single line of code.
            </p>
          </div>

          <div className="p-10 space-y-16">
            <section id="introduction">
              <h2 className="text-2xl font-bold text-[#1a1f36] mb-5">Introduction</h2>
              <p className="text-[#4f566b] leading-relaxed text-lg">
                AutoML Studio replaces the tedious process of manual Python data science. It handles intelligent type inference, null-value patching, algorithm scaling, model tournament cross-validation, and performance visualization across both Classification and Regression disciplines.
              </p>
            </section>

            <section id="upload-data">
              <h2 className="text-2xl font-bold text-[#1a1f36] mb-5 flex items-center gap-3">
                <span className="bg-[#e0e7ff] text-[#3730a3] p-1.5 rounded-lg border border-[#a5b4fc]/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </span>
                Data Upload Rules
              </h2>
              <div className="prose prose-slate max-w-none text-[#4f566b]">
                <p>To ensure seamless data processing, strictly adhere to the following rules:</p>
                <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 mt-4">
                  <ul className="space-y-3 m-0">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-green-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>
                      <span><strong>Format:</strong> Strictly <code>.csv</code> (Comma Separated Values) text arrays. No Excel binary files (`.xlsx`).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-green-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>
                      <span><strong>Headers:</strong> The first row must exclusively dictate column names.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-red-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                      <span><strong>File Size:</strong> Maximum optimal stability cap is 50MB. Uploads larger than 100MB may experience browser timeouts.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="preprocessing">
              <h2 className="text-2xl font-bold text-[#1a1f36] mb-5 border-b border-[#e3e8ee] pb-4">Data Preprocessing</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1f36]">Missing Value Imputation</h3>
                  <p className="text-[#4f566b] mt-1">If your dataset includes blanks or <code>NaN</code>, our engine must synthesize those gaps. <strong>Mean strategy</strong> replaces blanks with the column's mathematical average. <strong>Median strategy</strong> uses the middle sorted value (more robust against outliers).</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a1f36]">Feature Scaling</h3>
                  <p className="text-[#4f566b] mt-1">Numerical models weight massive numbers heavily. Setting scaling to <strong>StandardScaler</strong> compresses all features into normal distributions (mean 0, variance 1). Setting it to <strong>MinMax</strong> compresses data firmly between 0 and 1.</p>
                </div>
              </div>
            </section>

            <section id="algorithms">
              <h2 className="text-2xl font-bold text-[#1a1f36] mb-5 border-b border-[#e3e8ee] pb-4">Supported Algorithms</h2>
              <p className="text-[#4f566b] mb-6">We dynamically detect tasks based on Target variable structures. Discrete integers/strings generate Classification paradigms; continuous floats generate Regression.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-[#e3e8ee] rounded-xl shadow-sm">
                  <h4 className="font-bold text-[#1a1f36] mb-3 text-lg">Classification Tasks</h4>
                  <ul className="space-y-2 text-[#4f566b] text-sm list-disc pl-4">
                    <li><strong className="text-[#1a1f36]">Logistic Regression:</strong> Excellent linear baseline.</li>
                    <li><strong className="text-[#1a1f36]">Decision Tree:</strong> Visual branching logic. Prone to overfit.</li>
                    <li><strong className="text-[#1a1f36]">Random Forest:</strong> High stability ensemble algorithm.</li>
                    <li><strong className="text-[#1a1f36]">K-Nearest Neighbors:</strong> Clusters targets by spatial distance.</li>
                  </ul>
                </div>
                <div className="p-5 border border-[#e3e8ee] rounded-xl shadow-sm">
                  <h4 className="font-bold text-[#1a1f36] mb-3 text-lg">Regression Tasks</h4>
                  <ul className="space-y-2 text-[#4f566b] text-sm list-disc pl-4">
                    <li><strong className="text-[#1a1f36]">Linear Regression:</strong> Statistical line-of-best-fit.</li>
                    <li><strong className="text-[#1a1f36]">Decision Tree Regressor:</strong> Splits planes into continuous value chunks.</li>
                    <li><strong className="text-[#1a1f36]">Random Forest Regressor:</strong> Averages hundreds of simultaneous trees for accurate smoothing.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="evaluation">
              <h2 className="text-2xl font-bold text-[#1a1f36] mb-5 border-b border-[#e3e8ee] pb-4">Interpreting Results</h2>
              <div className="bg-[#fffbeb] border border-[#f59e0b]/30 p-6 rounded-xl">
                <h4 className="text-lg font-bold text-[#b54708] mb-2 flex items-center gap-2">
                  <span>🏆</span> What is a good R² Score?
                </h4>
                <p className="text-[#b54708]/90 text-sm leading-relaxed">
                  R-Squared signifies how much variance your model explains. A score of <code>1.00</code> is absolute perfection. A score of <code>0.00</code> means the model guesses randomly. Look for scores <code>&gt; 0.75</code> for robust production readiness.
                </p>
              </div>
            </section>

            <section id="export">
              <h2 className="text-2xl font-bold text-[#1a1f36] mb-5 border-b border-[#e3e8ee] pb-4">Export & Deployment</h2>
              <p className="text-[#4f566b] leading-relaxed mb-4">
                Once satisfied with your metrics, click the <strong>Export Model</strong> button on the results dashboard. This initiates a serialized download of the model object (standard <code>.pkl</code> or <code>.joblib</code> compatible stream).
              </p>
              <div className="bg-[#f0f9ff] border border-[#bae6fd] p-5 rounded-xl flex items-start gap-4">
                <div className="text-blue-500 mt-1">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-[#0369a1]">Production Ready</h4>
                  <p className="text-sm text-[#0369a1]">The exported file includes all necessary scaling parameters and label encoders required for local or production environment inference.</p>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DocsPage;
