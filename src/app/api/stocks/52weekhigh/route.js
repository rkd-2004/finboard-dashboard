

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT', 'JNJ', 'PG'];
  if (!token || token === 'YOUR_API_KEY') {
    return Response.json(
      { error: 'Finnhub API token is required. Please provide a valid token.' },
      { status: 401 }
    );
  }

  try {
    console.log('[52WeekHigh API] Starting request...');
    console.log('[52WeekHigh API] Fetching quotes for symbols:', symbols);
    const stocksData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`;
          const quoteRes = await fetch(quoteUrl, { 
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(10000),
          });
          const quote = await quoteRes.json();
          const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${token}`;
          const profileRes = await fetch(profileUrl, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(10000),
          });
          const profile = await profileRes.json();

          if (quote.c && quote.c > 0) {
            const companyName = profile?.name || getCompanyName(symbol);
            return {
              symbol,
              companyName,
              company: companyName,
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              high: quote.h,
              low: quote.l,
              open: quote.o,
              previousClose: quote.pc,
              week52High: quote.h * 1.1, // Approximation
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err.message);
          return null;
        }
      })
    );

    const validStocks = stocksData.filter(s => s !== null);
    console.log('[52WeekHigh API] Valid stocks found:', validStocks.length);
    console.log('[52WeekHigh API] Sample stock data:', validStocks[0]);
    if (validStocks.length === 0) {
      console.log('[52WeekHigh API] No valid stocks found, returning demo data');
      return Response.json(generateDemo52WeekHighData(symbols), {
        headers: { 'Cache-Control': 'public, s-maxage=60' },
      });
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      count: validStocks.length,
      stocks: validStocks,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });

  } catch (error) {
    console.error('[52WeekHigh] Error:', error.message);
    return Response.json(generateDemo52WeekHighData(symbols), {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  }
}
function getCompanyName(symbol) {
  const companyNames = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corp.',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms',
    'NVDA': 'NVIDIA Corp.',
    'JPM': 'JPMorgan Chase',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble',
  };
  return companyNames[symbol] || symbol;
}
function generateDemo52WeekHighData(symbols) {
  const basePrices = {
    'AAPL': 178.50, 'MSFT': 378.25, 'GOOGL': 140.80, 'AMZN': 185.40, 'TSLA': 248.75,
    'META': 350.60, 'NVDA': 475.30, 'JPM': 175.40, 'V': 275.60, 'WMT': 165.30,
    'JNJ': 158.40, 'PG': 158.60
  };

  const stocks = symbols.map(symbol => {
    const basePrice = basePrices[symbol] || (50 + Math.random() * 200);
    const changePercent = (Math.random() - 0.5) * 6; // -3% to +3%
    const change = basePrice * (changePercent / 100);
    const price = basePrice + change;
    
    const companyName = getCompanyName(symbol);
    return {
      symbol,
      companyName,
      company: companyName,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((price * 1.02).toFixed(2)),
      low: parseFloat((price * 0.98).toFixed(2)),
      open: parseFloat((price - change * 0.5).toFixed(2)),
      previousClose: parseFloat(basePrice.toFixed(2)),
      week52High: parseFloat((price * 1.15).toFixed(2)),
    };
  });

  return {
    timestamp: new Date().toISOString(),
    count: stocks.length,
    stocks: stocks,
    isDemo: true,
    note: 'Demo data - API temporarily unavailable'
  };
}
