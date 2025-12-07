

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';
  const resolution = searchParams.get('resolution') || 'D'; // D=daily, W=weekly, M=monthly
  let interval, range;
  switch (resolution) {
    case 'W':
      interval = '1wk';
      range = '2y';
      break;
    case 'M':
      interval = '1mo';
      range = '5y';
      break;
    case '60':
      interval = '60m';
      range = '1mo';
      break;
    case '15':
      interval = '15m';
      range = '5d';
      break;
    default: // 'D' daily
      interval = '1d';
      range = '6mo';
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=${interval}&range=${range}`;
    
    console.log(`[Candles API] Fetching from Yahoo Finance: ${symbol} (${interval}, ${range})`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const chart = data?.chart?.result?.[0];
    if (!chart || !chart.timestamp || chart.timestamp.length === 0) {
      console.log(`[Candles API] No data from Yahoo for ${symbol}, using demo`);
      const demoCandles = generateDemoCandles(symbol, resolution);
      return Response.json({ ...demoCandles, note: 'No market data available for this symbol' });
    }

    const timestamps = chart.timestamp;
    const quotes = chart.indicators.quote[0];
    const candles = timestamps.map((timestamp, i) => {
      if (quotes.open[i] === null || quotes.close[i] === null) return null;
      
      return {
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        timestamp: timestamp * 1000,
        open: parseFloat(quotes.open[i]?.toFixed(2)) || 0,
        high: parseFloat(quotes.high[i]?.toFixed(2)) || 0,
        low: parseFloat(quotes.low[i]?.toFixed(2)) || 0,
        close: parseFloat(quotes.close[i]?.toFixed(2)) || 0,
        volume: quotes.volume[i] || 0,
      };
    }).filter(c => c !== null); // Remove null entries

    if (candles.length === 0) {
      const demoCandles = generateDemoCandles(symbol, resolution);
      return Response.json({ ...demoCandles, note: 'No valid candle data' });
    }
    const currentPrice = candles[candles.length - 1]?.close || 0;
    const previousPrice = candles[candles.length - 2]?.close || currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice ? ((change / previousPrice) * 100) : 0;
    const periodStart = candles[0]?.close || currentPrice;
    const periodChange = currentPrice - periodStart;
    const periodChangePercent = periodStart ? ((periodChange / periodStart) * 100) : 0;

    const result = {
      symbol: symbol.toUpperCase(),
      resolution,
      currentPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      periodChange: parseFloat(periodChange.toFixed(2)),
      periodChangePercent: parseFloat(periodChangePercent.toFixed(2)),
      high52Week: Math.max(...candles.map(c => c.high)),
      low52Week: Math.min(...candles.map(c => c.low)),
      avgVolume: Math.round(candles.reduce((sum, c) => sum + c.volume, 0) / candles.length),
      candles,
      candleCount: candles.length,
      timestamp: new Date().toISOString(),
      isRealData: true,
      source: 'Yahoo Finance',
    };

    console.log(`[Candles API] Success: ${symbol} - ${candles.length} candles from Yahoo Finance`);

    return Response.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });

  } catch (error) {
    console.error('[Candles API] Error:', error.message);
    const demoCandles = generateDemoCandles(symbol, resolution);
    return Response.json({ ...demoCandles, error: error.message, note: 'Fallback demo data due to API error' });
  }
}
function generateDemoCandles(symbol, resolution) {
  const basePrices = {
    'AAPL': 178, 'MSFT': 378, 'GOOGL': 140, 'AMZN': 185, 'TSLA': 248,
    'NVDA': 475, 'META': 350, 'NFLX': 480, 'AMD': 125, 'INTC': 45,
  };
  
  let basePrice = basePrices[symbol.toUpperCase()] || 100;
  const volatility = 0.025; // 2.5% daily volatility
  const trend = 0.0003; // Slight upward trend
  
  const numCandles = resolution === 'W' ? 52 : resolution === 'M' ? 36 : 120;
  const msPerCandle = resolution === 'W' ? 7*24*60*60*1000 : resolution === 'M' ? 30*24*60*60*1000 : 24*60*60*1000;
  
  const candles = [];
  let currentPrice = basePrice * (0.85 + Math.random() * 0.3); // Start at random point
  const now = Date.now();
  
  for (let i = numCandles; i >= 0; i--) {
    const timestamp = now - (i * msPerCandle);
    const date = new Date(timestamp);
    if (resolution === 'D' && (date.getDay() === 0 || date.getDay() === 6)) continue;
    const randomWalk = (Math.random() - 0.48) * volatility * currentPrice; // Slight bullish bias
    const trendComponent = trend * currentPrice;
    
    const open = currentPrice;
    const close = currentPrice + randomWalk + trendComponent;
    const range = Math.abs(close - open);
    const wickSize = Math.random() * volatility * currentPrice * 0.5;
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;
    const volumeBase = 50000000;
    const volumeVariation = Math.abs(close - open) / open;
    const volume = Math.floor(volumeBase * (0.5 + Math.random() + volumeVariation * 5));
    
    candles.push({
      date: date.toISOString().split('T')[0],
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    
    currentPrice = close;
  }
  
  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const periodChange = lastCandle.close - firstCandle.close;
  const periodChangePercent = (periodChange / firstCandle.close) * 100;
  
  return {
    symbol: symbol.toUpperCase(),
    resolution,
    currentPrice: lastCandle.close,
    change: parseFloat((lastCandle.close - lastCandle.open).toFixed(2)),
    changePercent: parseFloat((((lastCandle.close - lastCandle.open) / lastCandle.open) * 100).toFixed(2)),
    periodChange: parseFloat(periodChange.toFixed(2)),
    periodChangePercent: parseFloat(periodChangePercent.toFixed(2)),
    high52Week: Math.max(...candles.map(c => c.high)),
    low52Week: Math.min(...candles.map(c => c.low)),
    avgVolume: Math.round(candles.reduce((sum, c) => sum + c.volume, 0) / candles.length),
    candles,
    candleCount: candles.length,
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}
