'use client';

import useDashboardStore from '@/store/useDashboardStore';
const FINNHUB_TOKEN = 'd4nmq0pr01qk2nucq330d4nmq0pr01qk2nucq33g';

const SAMPLE_WIDGETS = [
  {
    category: 'Market Overview',
    description: 'Professional dashboard widgets for market analysis',
    items: [
      {
        name: 'Tech Giants Performance',
        description: 'FAANG + Microsoft with full metrics table',
        apiUrl: `/api/stocks/finnhub?symbols=AAPL,MSFT,GOOGL,AMZN,META,NVDA&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 30000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Symbol', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
          { path: 'high', label: 'Day High', type: 'number' },
          { path: 'low', label: 'Day Low', type: 'number' },
          { path: 'volume', label: 'Volume', type: 'number' },
        ],
      },
      {
        name: '52 Week High Stocks',
        description: 'Stocks trading near their yearly highs',
        apiUrl: `/api/stocks/52weekhigh?token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Symbol', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Current Price', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: 'Day Change %', type: 'number' },
          { path: 'high', label: 'Day High', type: 'number' },
          { path: 'low', label: 'Day Low', type: 'number' },
        ],
      },
      {
        name: 'Market Movers Chart',
        description: 'Visual comparison of top tech stocks',
        apiUrl: `/api/stocks/finnhub?symbols=AAPL,MSFT,GOOGL,NVDA,TSLA&token=${FINNHUB_TOKEN}`,
        displayMode: 'chart',
        refreshInterval: 30000,
        selectedFields: [
          { path: 'AAPL.price', label: 'Apple', type: 'number' },
          { path: 'MSFT.price', label: 'Microsoft', type: 'number' },
          { path: 'GOOGL.price', label: 'Google', type: 'number' },
          { path: 'NVDA.price', label: 'NVIDIA', type: 'number' },
          { path: 'TSLA.price', label: 'Tesla', type: 'number' },
        ],
      },
    ],
  },
  {
    category: 'Sector Analysis',
    description: 'Comprehensive sector-wise stock tracking',
    items: [
      {
        name: 'Banking Sector Table',
        description: 'Major US banks with full trading data',
        apiUrl: `/api/stocks/finnhub?symbols=JPM,BAC,WFC,GS,MS,C&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Ticker', type: 'string' },
          { path: 'companyName', label: 'Bank', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
          { path: 'high', label: 'High', type: 'number' },
          { path: 'low', label: 'Low', type: 'number' },
        ],
      },
      {
        name: 'Semiconductor Industry',
        description: 'Chip makers performance tracking',
        apiUrl: `/api/stocks/finnhub?symbols=NVDA,AMD,INTC,QCOM,AVGO,TSM&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Ticker', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
        ],
      },
      {
        name: 'Healthcare Stocks',
        description: 'Pharmaceutical and healthcare giants',
        apiUrl: `/api/stocks/finnhub?symbols=JNJ,PFE,UNH,MRK,ABBV,LLY&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Ticker', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
        ],
      },
      {
        name: 'Energy Sector',
        description: 'Oil & gas companies tracking',
        apiUrl: `/api/stocks/finnhub?symbols=XOM,CVX,COP,SLB,EOG,OXY&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Ticker', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
        ],
      },
    ],
  },
  {
    category: 'Consumer & Retail',
    description: 'Consumer discretionary and staples',
    items: [
      {
        name: 'Retail Giants',
        description: 'Major retail companies performance',
        apiUrl: `/api/stocks/finnhub?symbols=WMT,COST,TGT,HD,LOW,AMZN&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Ticker', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
        ],
      },
      {
        name: 'Consumer Brands',
        description: 'Popular consumer product companies',
        apiUrl: `/api/stocks/finnhub?symbols=KO,PEP,PG,NKE,SBUX,MCD&token=${FINNHUB_TOKEN}`,
        displayMode: 'table',
        refreshInterval: 60000,
        arrayPath: 'stocks',
        selectedFields: [
          { path: 'symbol', label: 'Ticker', type: 'string' },
          { path: 'companyName', label: 'Company', type: 'string' },
          { path: 'price', label: 'Price ($)', type: 'number' },
          { path: 'change', label: 'Change', type: 'number' },
          { path: 'changePercent', label: '% Change', type: 'number' },
        ],
      },
    ],
  },
  {
    category: 'Price Comparison Charts',
    description: 'Visual comparisons across sectors',
    items: [
      {
        name: 'Tech Price Chart',
        description: 'FAANG stock prices visualization',
        apiUrl: `/api/stocks/finnhub?symbols=AAPL,MSFT,GOOGL,AMZN,META&token=${FINNHUB_TOKEN}`,
        displayMode: 'chart',
        refreshInterval: 30000,
        selectedFields: [
          { path: 'AAPL.price', label: 'Apple', type: 'number' },
          { path: 'MSFT.price', label: 'Microsoft', type: 'number' },
          { path: 'GOOGL.price', label: 'Google', type: 'number' },
          { path: 'AMZN.price', label: 'Amazon', type: 'number' },
          { path: 'META.price', label: 'Meta', type: 'number' },
        ],
      },
      {
        name: 'Semiconductor Price Chart',
        description: 'Chip makers price comparison',
        apiUrl: `/api/stocks/finnhub?symbols=NVDA,AMD,INTC,QCOM,AVGO&token=${FINNHUB_TOKEN}`,
        displayMode: 'chart',
        refreshInterval: 30000,
        selectedFields: [
          { path: 'NVDA.price', label: 'NVIDIA', type: 'number' },
          { path: 'AMD.price', label: 'AMD', type: 'number' },
          { path: 'INTC.price', label: 'Intel', type: 'number' },
          { path: 'QCOM.price', label: 'Qualcomm', type: 'number' },
          { path: 'AVGO.price', label: 'Broadcom', type: 'number' },
        ],
      },
      {
        name: 'Banking Sector Chart',
        description: 'Major banks price visualization',
        apiUrl: `/api/stocks/finnhub?symbols=JPM,BAC,WFC,GS,MS&token=${FINNHUB_TOKEN}`,
        displayMode: 'chart',
        refreshInterval: 30000,
        selectedFields: [
          { path: 'JPM.price', label: 'JPMorgan', type: 'number' },
          { path: 'BAC.price', label: 'Bank of America', type: 'number' },
          { path: 'WFC.price', label: 'Wells Fargo', type: 'number' },
          { path: 'GS.price', label: 'Goldman Sachs', type: 'number' },
          { path: 'MS.price', label: 'Morgan Stanley', type: 'number' },
        ],
      },
    ],
  },
  {
    category: 'Quick Stats Cards',
    description: 'Compact price overview cards',
    items: [
      {
        name: 'Tech Giants Card',
        description: 'Quick view of big tech prices',
        apiUrl: `/api/stocks/finnhub?symbols=AAPL,MSFT,GOOGL,AMZN,META,NVDA&token=${FINNHUB_TOKEN}`,
        displayMode: 'card',
        refreshInterval: 30000,
        selectedFields: [
          { path: 'AAPL.price', label: 'Apple', type: 'number' },
          { path: 'MSFT.price', label: 'Microsoft', type: 'number' },
          { path: 'GOOGL.price', label: 'Google', type: 'number' },
          { path: 'AMZN.price', label: 'Amazon', type: 'number' },
          { path: 'META.price', label: 'Meta', type: 'number' },
          { path: 'NVDA.price', label: 'NVIDIA', type: 'number' },
        ],
      },
      {
        name: 'EV & Auto Card',
        description: 'Electric vehicle companies',
        apiUrl: `/api/stocks/finnhub?symbols=TSLA,RIVN,F,GM,TM&token=${FINNHUB_TOKEN}`,
        displayMode: 'card',
        refreshInterval: 30000,
        selectedFields: [
          { path: 'TSLA.price', label: 'Tesla', type: 'number' },
          { path: 'RIVN.price', label: 'Rivian', type: 'number' },
          { path: 'F.price', label: 'Ford', type: 'number' },
          { path: 'GM.price', label: 'GM', type: 'number' },
          { path: 'TM.price', label: 'Toyota', type: 'number' },
        ],
      },
    ],
  },
];

const SampleApiList = ({ isOpen, onClose }) => {
  const { addWidget, removeWidget, widgets, theme } = useDashboardStore();

  if (!isOpen) return null;
  const isWidgetAdded = (itemName) => {
    return widgets.some(w => w.name === itemName);
  };
  const getWidgetIdByName = (itemName) => {
    const widget = widgets.find(w => w.name === itemName);
    return widget?.id;
  };

  const handleToggleWidget = (item) => {
    const existingWidgetId = getWidgetIdByName(item.name);
    
    if (existingWidgetId) {
      removeWidget(existingWidgetId);
    } else {
      addWidget({
        name: item.name,
        apiUrl: item.apiUrl,
        refreshInterval: item.refreshInterval,
        displayMode: item.displayMode,
        selectedFields: item.selectedFields,
        arrayPath: item.arrayPath || null,
      });
    }
  };

  const handleAddAll = () => {
    const allWidgetsAdded = SAMPLE_WIDGETS.every((category) =>
      category.items.every((item) => isWidgetAdded(item.name))
    );

    if (allWidgetsAdded) {
      SAMPLE_WIDGETS.forEach((category) => {
        category.items.forEach((item) => {
          const widgetId = getWidgetIdByName(item.name);
          if (widgetId) {
            removeWidget(widgetId);
          }
        });
      });
    } else {
      SAMPLE_WIDGETS.forEach((category) => {
        category.items.forEach((item) => {
          if (!isWidgetAdded(item.name)) {
            addWidget({
              name: item.name,
              apiUrl: item.apiUrl,
              refreshInterval: item.refreshInterval,
              displayMode: item.displayMode,
              selectedFields: item.selectedFields,
              arrayPath: item.arrayPath || null,
            });
          }
        });
      });
    }
  };
  const allWidgetsAdded = SAMPLE_WIDGETS.every((category) =>
    category.items.every((item) => isWidgetAdded(item.name))
  );

  const totalWidgets = SAMPLE_WIDGETS.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      } flex flex-col`}>
        {}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Add Widgets
            </h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Real-time stock data from Finnhub API
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddAll}
              className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                allWidgetsAdded 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {allWidgetsAdded ? `Remove All (${totalWidgets})` : `Add All (${totalWidgets})`}
            </button>
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
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {SAMPLE_WIDGETS.map((category) => (
              <div key={category.category}>
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.category}
                </h3>
                {category.description && (
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    {category.description}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item) => {
                    const isAdded = isWidgetAdded(item.name);
                    return (
                      <div
                        key={item.name}
                        className={`p-4 rounded-xl border transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        } ${isAdded ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {item.name}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                                item.displayMode === 'card'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : item.displayMode === 'table'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {item.displayMode}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${
                              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.selectedFields.slice(0, 4).map((f) => (
                                <span
                                  key={f.path}
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  {f.label}
                                </span>
                              ))}
                              {item.selectedFields.length > 4 && (
                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                                  +{item.selectedFields.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleWidget(item)}
                            className={`ml-3 p-2 rounded-lg transition-all flex-shrink-0 ${
                              isAdded
                                ? 'bg-emerald-500 text-white hover:bg-red-500'
                                : theme === 'dark'
                                  ? 'bg-slate-700 hover:bg-emerald-500 text-slate-300 hover:text-white'
                                  : 'bg-gray-200 hover:bg-emerald-500 text-gray-600 hover:text-white'
                            }`}
                            title={isAdded ? 'Click to remove' : 'Click to add'}
                          >
                            {isAdded ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
            }`}>
              All data powered by Finnhub API - Real-time stock prices
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              {widgets.length} widget{widgets.length !== 1 ? 's' : ''} on dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SAMPLE_WIDGETS };
export default SampleApiList;
