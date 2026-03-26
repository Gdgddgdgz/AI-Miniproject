import React, { useCallback, useState } from 'react';
import { api } from '../../api/client';
import { useAppContext } from '../../context/AppContext';

const FileUploader = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { setDatasetInfo, setPreviewData, setColumns, resetApp } = useAppContext();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    resetApp();

    try {
      const resp = await api.uploadDataset(file);
      const data = resp.data;
      
      setDatasetInfo({
        filename: data.filename,
        shape: data.shape,
        badges: data.dtypes,
        dtypes: data.dtypes,
      });
      setPreviewData(data.preview);
      setColumns(data.columns);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`dropzone rounded-xl p-10 text-center flex flex-col items-center justify-center cursor-pointer min-h-[220px] ${isHovering ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && document.getElementById('file-upload').click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="saas-spinner"></div>
            <p className="text-[#635bff] font-medium text-sm">Uploading and analyzing your data...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <h3 className="text-[#1a1f36] font-semibold text-lg mb-1">Click to upload or drag and drop</h3>
            <p className="text-[#4f566b] text-sm">CSV files only. Maximum file size 50MB.</p>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              id="file-upload" 
              onChange={onFileSelect} 
            />
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-[var(--danger-bg)] border border-[#fca5a5] rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-[var(--danger-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="text-[var(--danger-text)] text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
