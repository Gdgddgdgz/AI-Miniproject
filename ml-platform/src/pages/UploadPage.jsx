import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/Upload/FileUploader';
import DatasetTable from '../components/Dataset/DatasetTable';
import { useAppContext } from '../context/AppContext';

const UploadPage = () => {
  const { datasetInfo } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className={`w-full mx-auto space-y-10 transition-all duration-300 ${!datasetInfo ? 'max-w-2xl flex flex-col items-center justify-center min-h-[60vh]' : 'max-w-7xl'}`}>
      
      {!datasetInfo && (
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold text-[#1a1f36] mb-4 tracking-tight">
            Train models without writing code
          </h1>
          <p className="text-[#4f566b] text-base max-w-xl mx-auto leading-relaxed">
            Upload your dataset, configure parameters visually, and let Aura engine build high-performance machine learning models instantly.
          </p>
        </div>
      )}

      <div className={`w-full ${!datasetInfo ? 'max-w-2xl' : 'max-w-4xl mx-auto'}`}>
        <FileUploader />
      </div>

      {datasetInfo && (
        <div className="animate-slide-up mt-12 space-y-6 w-full" style={{ opacity: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1f36]">{datasetInfo.filename}</h2>
              <p className="text-[#4f566b] text-sm mt-1">Previewing the first 10 rows of your dataset.</p>
            </div>
            <button 
              onClick={() => navigate('/config')}
              className="btn-primary px-6 py-2.5 flex items-center gap-2 shadow-sm text-sm font-semibold whitespace-nowrap"
            >
              Continue to Configuration
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
          
          <div className="bg-white border border-[#e3e8ee] rounded-xl shadow-sm overflow-hidden w-full">
            <DatasetTable maxRows={10} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
