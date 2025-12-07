'use client';

import { useState, useEffect, useMemo } from 'react';
import useDashboardStore from '@/store/useDashboardStore';
import { testApiEndpoint, flattenFields, findArraysInResponse } from '@/utils/apiUtils';

const AddWidgetModal = ({ isOpen, onClose }) => {
  const { addWidget, theme } = useDashboardStore();
  
  const [step, setStep] = useState(1);
  const [widgetName, setWidgetName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState('card');
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedArrayPath, setSelectedArrayPath] = useState('');
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableArrays, setAvailableArrays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setWidgetName('');
      setApiUrl('');
      setRefreshInterval(30);
      setDisplayMode('card');
      setSelectedFields([]);
      setSelectedArrayPath('');
      setTestResult(null);
      setAvailableFields([]);
      setAvailableArrays([]);
      setSearchTerm('');
      setShowArraysOnly(false);
    }
  }, [isOpen]);

  const handleTestApi = async () => {
    if (!apiUrl) return;
    
    setTesting(true);
    setTestResult(null);
    
    const result = await testApiEndpoint(apiUrl);
    setTestResult(result);
    
    if (result.success) {
      setAvailableFields(result.fields);
      const arrays = findArraysInResponse(result.data);
      setAvailableArrays(arrays);
    }
    
    setTesting(false);
  };

  const flatFields = useMemo(() => {
    return flattenFields(availableFields);
  }, [availableFields]);

  const filteredFields = useMemo(() => {
    let fields = flatFields;
    
    if (searchTerm) {
      fields = fields.filter(f => 
        f.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return fields;
  }, [flatFields, searchTerm]);

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => {
      const exists = prev.find((f) => f.path === field.path);
      if (exists) {
        return prev.filter((f) => f.path !== field.path);
      }
      let defaultFormat = 'number';
      if (field.type === 'currency') defaultFormat = 'currency';
      else if (field.type === 'percentage') defaultFormat = 'percentage';
      else if (field.type === 'date' || field.type === 'datetime') defaultFormat = 'date';
      return [...prev, { path: field.path, label: field.path.split('.').pop(), type: field.type, formatType: defaultFormat }];
    });
  };

  const handleFormatChange = (fieldPath, newFormat) => {
    setSelectedFields((prev) =>
      prev.map((f) =>
        f.path === fieldPath ? { ...f, formatType: newFormat } : f
      )
    );
  };

  const handleAddWidget = () => {
    if (!widgetName || !apiUrl || selectedFields.length === 0) return;
    addWidget({
      name: widgetName,
      apiUrl,
      refreshInterval: refreshInterval * 1000,
      displayMode,
      selectedFields,
      arrayPath: displayMode === 'table' ? selectedArrayPath : null,
    });
    onClose();
  };

  const canProceedStep1 = widgetName && apiUrl && testResult?.success;
  const canProceedStep2 = selectedFields.length > 0 && (displayMode !== 'table' || selectedArrayPath);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      } flex flex-col`}>
        {}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Add New Widget
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              {}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Widget Name
                </label>
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder="e.g., Bitcoin Price Tracker"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  API URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                    className={`flex-1 px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                  <button
                    onClick={handleTestApi}
                    disabled={!apiUrl || testing}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testing ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Test
                  </button>
                </div>
                
                {}
                {testResult && (
                  <div className={`mt-2 p-3 rounded-lg text-sm ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {testResult.success ? (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        API connection successful! {flatFields.length} top-level fields found.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Error: {testResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Display Mode
                </label>
                <div className="flex gap-2">
                  {['card', 'table', 'chart'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize flex items-center gap-2 ${
                        displayMode === mode
                          ? 'bg-emerald-500 text-white'
                          : theme === 'dark'
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {mode === 'card' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      )}
                      {mode === 'table' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {mode === 'chart' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {}
              {displayMode === 'table' && availableArrays.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Select Data Array
                  </label>
                  <select
                    value={selectedArrayPath}
                    onChange={(e) => setSelectedArrayPath(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  >
                    <option value="">Select an array...</option>
                    {availableArrays.map((arr) => (
                      <option key={arr.path} value={arr.path}>
                        {arr.path} ({arr.data.length} items)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Search Fields
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for fields..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
                
                {displayMode === 'table' && (
                  <label className={`flex items-center gap-2 mt-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    <input
                      type="checkbox"
                      checked={showArraysOnly}
                      onChange={(e) => setShowArraysOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Show arrays only (for table view)</span>
                  </label>
                )}
              </div>

              {}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Available Fields
                </label>
                <div className={`max-h-48 overflow-y-auto rounded-lg border ${
                  theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'
                }`}>
                  {filteredFields.length === 0 ? (
                    <p className={`p-4 text-center ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                    }`}>
                      No fields found
                    </p>
                  ) : (
                    filteredFields.map((field) => (
                      <div
                        key={field.path}
                        onClick={() => handleFieldToggle(field)}
                        className={`flex items-center justify-between px-4 py-2 cursor-pointer border-b last:border-b-0 ${
                          theme === 'dark'
                            ? 'border-slate-800 hover:bg-slate-800'
                            : 'border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                          }`}>
                            {field.path}
                          </p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                          }`}>
                            {field.type} | {field.sample}
                          </p>
                        </div>
                        {selectedFields.find((f) => f.path === field.path) ? (
                          <span className="text-emerald-500">✓</span>
                        ) : (
                          <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}>+</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {}
              {selectedFields.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Selected Fields & Formatting
                  </label>
                  <div className="flex flex-col gap-2">
                    {selectedFields.map((field) => (
                      <div
                        key={field.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          theme === 'dark'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <span>{field.label}</span>
                        <select
                          value={field.formatType}
                          onChange={(e) => handleFormatChange(field.path, e.target.value)}
                          className={`ml-2 px-2 py-1 rounded border text-xs ${
                            theme === 'dark'
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="percentage">Percentage</option>
                          <option value="date">Date</option>
                        </select>
                        <button
                          onClick={() => handleFieldToggle(field)}
                          className="ml-1 hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div className={`flex items-center justify-between p-6 border-t ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleAddWidget}
                  disabled={!canProceedStep2}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Widget
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;
