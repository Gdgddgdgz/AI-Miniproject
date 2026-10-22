import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Dataset state
  const [datasetInfo, setDatasetInfo] = useState(null); // shape, dtypes, filename, image metadata
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // Preprocessing / Configuration state
  const [targetColumn, setTargetColumn] = useState('');
  const [problemType, setProblemType] = useState('');
  const [testSize, setTestSize] = useState(0.2);
  
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
  const resetApp = useCallback(() => {
    setDatasetInfo(null);
    setPreviewData([]);
    setColumns([]);
    setTargetColumn('');
    setProblemType('');
    setTestSize(0.2);
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
  }, []);

  return (
    <AppContext.Provider value={{
      datasetInfo, setDatasetInfo,
      previewData, setPreviewData,
      columns, setColumns,
      targetColumn, setTargetColumn,
      problemType, setProblemType,
      testSize, setTestSize,
      trainResults, setTrainResults,
      compareResults, setCompareResults,
      advancedConfig, setAdvancedConfig,
      resetApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Context hooks live with their provider to keep the app state API together.
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
