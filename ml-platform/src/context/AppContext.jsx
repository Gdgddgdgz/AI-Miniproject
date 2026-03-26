import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Dataset state
  const [datasetInfo, setDatasetInfo] = useState(null); // shape, dtypes, filename
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // Analysis state
  const [analysis, setAnalysis] = useState(null); // missing_values, unique_values, stats
  
  // Preprocessing / Configuration state
  const [targetColumn, setTargetColumn] = useState('');
  const [problemType, setProblemType] = useState('');
  const [testSize, setTestSize] = useState(0.2);
  const [selectedModel, setSelectedModel] = useState('');
  
  // Advanced Configuration
  const [advancedConfig, setAdvancedConfig] = useState({
    features_to_drop: [],
    imputation_strategy: 'mean',
    optimization_mode: 'fast',
    scaling: 'none',
    cv_folds: 5,
    optimization_metric: 'auto',
    random_seed: 42
  });
  
  // Results state
  const [trainResults, setTrainResults] = useState(null);
  const [compareResults, setCompareResults] = useState(null);

  // Global app methods
  const resetApp = () => {
    setDatasetInfo(null);
    setPreviewData([]);
    setColumns([]);
    setAnalysis(null);
    setTargetColumn('');
    setProblemType('');
    setTestSize(0.2);
    setSelectedModel('');
    setTrainResults(null);
    setCompareResults(null);
    setAdvancedConfig({
      features_to_drop: [],
      imputation_strategy: 'mean',
      optimization_mode: 'fast',
      scaling: 'none',
      cv_folds: 5,
      optimization_metric: 'auto',
      random_seed: 42
    });
  };

  return (
    <AppContext.Provider value={{
      datasetInfo, setDatasetInfo,
      previewData, setPreviewData,
      columns, setColumns,
      analysis, setAnalysis,
      targetColumn, setTargetColumn,
      problemType, setProblemType,
      testSize, setTestSize,
      selectedModel, setSelectedModel,
      trainResults, setTrainResults,
      compareResults, setCompareResults,
      advancedConfig, setAdvancedConfig,
      resetApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
