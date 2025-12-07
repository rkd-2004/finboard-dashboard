const COMPANY_NAMES = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corp.',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corp.',
  'META': 'Meta Platforms',
  'NFLX': 'Netflix Inc.',
  'AMD': 'AMD Inc.',
  'INTC': 'Intel Corp.',
  'QCOM': 'Qualcomm Inc.',
  'AVGO': 'Broadcom Inc.',
  'TSM': 'Taiwan Semi',
  'JPM': 'JPMorgan Chase',
  'BAC': 'Bank of America',
  'WFC': 'Wells Fargo',
  'GS': 'Goldman Sachs',
  'MS': 'Morgan Stanley',
  'C': 'Citigroup Inc.',
  'USB': 'US Bancorp',
  'WMT': 'Walmart Inc.',
  'COST': 'Costco Wholesale',
  'TGT': 'Target Corp.',
  'HD': 'Home Depot',
  'LOW': "Lowe's Companies",
  'NKE': 'Nike Inc.',
  'KO': 'Coca-Cola Co.',
  'PEP': 'PepsiCo Inc.',
  'PG': 'Procter & Gamble',
  'SBUX': 'Starbucks Corp.',
  'MCD': "McDonald's Corp.",
  'JNJ': 'Johnson & Johnson',
  'PFE': 'Pfizer Inc.',
  'UNH': 'UnitedHealth Group',
  'MRK': 'Merck & Co.',
  'ABBV': 'AbbVie Inc.',
  'LLY': 'Eli Lilly & Co.',
  'XOM': 'Exxon Mobil',
  'CVX': 'Chevron Corp.',
  'COP': 'ConocoPhillips',
  'SLB': 'Schlumberger',
  'EOG': 'EOG Resources',
  'OXY': 'Occidental Petrol',
  'DIS': 'Walt Disney Co.',
  'V': 'Visa Inc.',
  'MA': 'Mastercard Inc.',
  'F': 'Ford Motor Co.',
  'GM': 'General Motors',
  'TM': 'Toyota Motor',
  'RIVN': 'Rivian Automotive',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols') || 'AAPL,MSFT,GOOGL,AMZN,TSLA';
  const apiKey = searchParams.get('token') || process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.log('[Finnhub API] No API key found, returning demo data');
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    const demoStocks = generateDemoQuotes(symbols);
    return Response.json({
      ...demoStocks,
      note: 'Demo data - Add token parameter or FINNHUB_API_KEY to .env.local for real data'
    });
  }

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());

  try {
    console.log(`[Finnhub API] Using API key: ${apiKey.substring(0, 10)}...`);
    console.log(`[Finnhub API] Fetching real quotes for: ${symbols.join(', ')}`);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const quotes = [];
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
      if (i > 0) {
        console.log(`[Finnhub API] Waiting 1.2s before next request to avoid rate limit...`);
        await delay(1200);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        console.log(`[Finnhub API] Requesting ${symbol} (${i + 1}/${symbols.length}): ${url}`);
        
        const response = await fetch(url, {
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'FinBoard/1.0'
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log(`[Finnhub API] Error for ${symbol}: HTTP ${response.status} - ${response.statusText}`);
          if (response.status === 429) {
            console.log(`[Finnhub API] Rate limit exceeded, waiting 5 seconds before retrying ${symbol}...`);
            await delay(5000);
            const retryResponse = await fetch(url, {
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'FinBoard/1.0'
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              console.log(`[Finnhub API] Retry successful for ${symbol}:`, data);
              const companyName = COMPANY_NAMES[symbol] || symbol;
              quotes.push({
                symbol,
                companyName,
                company: companyName, // Add company field for compatibility
                currentPrice: data.c,
                change: data.d,
                changePercent: data.dp,
                highPrice: data.h,
                lowPrice: data.l,
                openPrice: data.o,
                previousClose: data.pc,
              });
              continue;
            }
          }
          quotes.push({ symbol, error: `HTTP ${response.status}: ${response.statusText}` });
          continue;
        }
        
        const data = await response.json();
        console.log(`[Finnhub API] Response for ${symbol}:`, data);
        if (data.c === 0 && data.h === 0 && data.l === 0) {
          console.log(`[Finnhub API] No valid data for ${symbol}`);
          quotes.push({ symbol, error: 'No data available' });
          continue;
        }
        
        quotes.push({
          symbol,
          companyName: COMPANY_NAMES[symbol] || symbol,
          company: COMPANY_NAMES[symbol] || symbol, // Add company field for compatibility
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          high: data.h,
          low: data.l,
          open: data.o,
          previousClose: data.pc,
          volume: data.v || 0,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.log(`[Finnhub API] Request failed for ${symbol}:`, err.message);
        quotes.push({ symbol, error: err.message });
      }
    }
    const validQuotes = quotes.filter(q => !q.error);
    const errors = quotes.filter(q => q.error);
    if (validQuotes.length === 0 && errors.length > 0) {
      console.log('[Finnhub API] All requests failed, returning demo data');
      const demoStocks = generateDemoQuotes(symbols);
      return Response.json({
        ...demoStocks,
        note: 'Demo data - API rate limit reached. Try again later for real data.',
        rateLimited: true,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }
    const result = {
      timestamp: new Date().toISOString(),
      count: validQuotes.length,
    };
    validQuotes.forEach(quote => {
      result[quote.symbol] = {
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        high: quote.high,
        low: quote.low,
      };
    });
    result.stocks = validQuotes;
    
    if (errors.length > 0) {
      result.errors = errors;
    }

    return Response.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Finnhub Multi] Error:', error.message);
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    const demoStocks = generateDemoQuotes(symbols);
    return Response.json({
      ...demoStocks,
      error: error.message,
      note: 'Fallback demo data due to API error'
    });
  }
}
function generateDemoQuotes(symbols) {
  const basePrices = {
    'AAPL': 178.50, 'MSFT': 378.25, 'GOOGL': 140.80, 'AMZN': 185.40, 'TSLA': 248.75,
    'NVDA': 475.30, 'META': 350.60, 'NFLX': 480.20, 'AMD': 125.15, 'INTC': 45.80,
    'JPM': 175.40, 'BAC': 32.50, 'WMT': 165.30, 'DIS': 95.20, 'V': 275.60,
    'QCOM': 165.40, 'AVGO': 890.25, 'TSM': 105.80, 'WFC': 48.30, 'GS': 425.60,
    'MS': 95.40, 'C': 52.80, 'USB': 42.15, 'COST': 585.40, 'TGT': 142.30,
    'HD': 345.60, 'LOW': 225.80, 'NKE': 105.40, 'KO': 62.30, 'PEP': 175.40,
    'PG': 158.60, 'SBUX': 98.40, 'MCD': 285.30, 'JNJ': 158.40, 'PFE': 28.60,
    'UNH': 545.80, 'MRK': 108.40, 'ABBV': 175.60, 'LLY': 625.40, 'XOM': 105.30,
    'CVX': 148.60, 'COP': 112.40, 'SLB': 48.60, 'EOG': 125.40, 'OXY': 62.30,
    'F': 12.40, 'GM': 38.60, 'TM': 185.40, 'RIVN': 18.60,
  };

  const stocks = symbols.map(symbol => {
    const basePrice = basePrices[symbol] || (50 + Math.random() * 200);
    const changePercent = (Math.random() - 0.5) * 6; // -3% to +3%
    const change = basePrice * (changePercent / 100);
    const price = basePrice + change;
    const volatility = basePrice * 0.02;
    
    const companyName = COMPANY_NAMES[symbol] || symbol;
    return {
      symbol,
      companyName,
      company: companyName, // Add company field as alias for compatibility
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((price + volatility).toFixed(2)),
      low: parseFloat((price - volatility).toFixed(2)),
      open: parseFloat((price - change * 0.5).toFixed(2)),
      previousClose: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 1000000,
    };
  });

  const result = {
    timestamp: new Date().toISOString(),
    count: stocks.length,
    isDemo: true,
  };

  stocks.forEach(quote => {
    result[quote.symbol] = {
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      high: quote.high,
      low: quote.low,
    };
  });

  result.stocks = stocks;
  return result;
}
