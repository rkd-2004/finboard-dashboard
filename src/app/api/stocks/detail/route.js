

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase() || 'AAPL';
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return Response.json(generateDemoDetail(symbol), {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  }

  const baseUrl = 'https://finnhub.io/api/v1';

  try {
    console.log(`[Stock Detail] Fetching real data for ${symbol}...`);
    const [quoteRes, profileRes, metricsRes, recommendRes, targetRes] = await Promise.all([
      fetch(`${baseUrl}/quote?symbol=${symbol}&token=${apiKey}`, {
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${baseUrl}/stock/profile2?symbol=${symbol}&token=${apiKey}`, {
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${baseUrl}/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`, {
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${baseUrl}/stock/recommendation?symbol=${symbol}&token=${apiKey}`, {
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${baseUrl}/stock/price-target?symbol=${symbol}&token=${apiKey}`, {
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const [quote, profile, metrics, recommendations, priceTarget] = await Promise.all([
      quoteRes.json(),
      profileRes.json(),
      metricsRes.json(),
      recommendRes.json(),
      targetRes.json(),
    ]);
    const result = {
      symbol,
      timestamp: new Date().toISOString(),
      name: profile.name || symbol,
      logo: profile.logo || null,
      industry: profile.finnhubIndustry || 'N/A',
      exchange: profile.exchange || 'N/A',
      country: profile.country || 'N/A',
      weburl: profile.weburl || null,
      price: quote.c || 0,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      high: quote.h || 0,
      low: quote.l || 0,
      open: quote.o || 0,
      previousClose: quote.pc || 0,
      week52High: metrics.metric?.['52WeekHigh'] || 0,
      week52Low: metrics.metric?.['52WeekLow'] || 0,
      week52HighDate: metrics.metric?.['52WeekHighDate'] || 'N/A',
      week52LowDate: metrics.metric?.['52WeekLowDate'] || 'N/A',
      day5Return: metrics.metric?.['5DayPriceReturnDaily'] || 0,
      day13WeekReturn: metrics.metric?.['13WeekPriceReturnDaily'] || 0,
      day26WeekReturn: metrics.metric?.['26WeekPriceReturnDaily'] || 0,
      ytdReturn: metrics.metric?.yearToDatePriceReturnDaily || 0,
      marketCap: profile.marketCapitalization || 0,
      peRatio: metrics.metric?.peBasicExclExtraTTM || 0,
      pbRatio: metrics.metric?.pbQuarterly || 0,
      psRatio: metrics.metric?.psAnnual || 0,
      dividendYield: metrics.metric?.dividendYieldIndicatedAnnual || 0,
      dividendPerShare: metrics.metric?.dividendPerShareAnnual || 0,
      strongBuy: recommendations?.[0]?.strongBuy || 0,
      buy: recommendations?.[0]?.buy || 0,
      hold: recommendations?.[0]?.hold || 0,
      sell: recommendations?.[0]?.sell || 0,
      strongSell: recommendations?.[0]?.strongSell || 0,
      targetHigh: priceTarget.targetHigh || 0,
      targetLow: priceTarget.targetLow || 0,
      targetMean: priceTarget.targetMean || 0,
      targetMedian: priceTarget.targetMedian || 0,
      beta: metrics.metric?.beta || 0,
      eps: metrics.metric?.epsBasicExclExtraItemsTTM || 0,
      revenueGrowth: metrics.metric?.revenueGrowthQuarterlyYoy || 0,
      profitMargin: metrics.metric?.netProfitMarginTTM || 0,
      roe: metrics.metric?.roeTTM || 0,
      roa: metrics.metric?.roaTTM || 0,
    };

    return Response.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });

  } catch (error) {
    console.error('[Stock Detail] Error:', error.message);
    return Response.json({
      ...generateDemoDetail(symbol),
      error: error.message,
      note: 'Fallback demo data due to API error'
    });
  }
}
function generateDemoDetail(symbol) {
  const demoData = {
    'AAPL': { name: 'Apple Inc.', industry: 'Technology', price: 178.50, marketCap: 2800000, pe: 28.5, eps: 6.26 },
    'MSFT': { name: 'Microsoft Corporation', industry: 'Technology', price: 378.25, marketCap: 2810000, pe: 35.2, eps: 10.75 },
    'GOOGL': { name: 'Alphabet Inc.', industry: 'Communication Services', price: 140.80, marketCap: 1780000, pe: 25.1, eps: 5.61 },
    'AMZN': { name: 'Amazon.com Inc.', industry: 'Consumer Cyclical', price: 185.40, marketCap: 1900000, pe: 78.5, eps: 2.36 },
    'TSLA': { name: 'Tesla Inc.', industry: 'Consumer Cyclical', price: 248.75, marketCap: 790000, pe: 72.3, eps: 3.44 },
    'NVDA': { name: 'NVIDIA Corporation', industry: 'Technology', price: 475.30, marketCap: 1170000, pe: 64.2, eps: 7.40 },
    'META': { name: 'Meta Platforms Inc.', industry: 'Communication Services', price: 350.60, marketCap: 900000, pe: 26.8, eps: 13.08 },
    'NFLX': { name: 'Netflix Inc.', industry: 'Communication Services', price: 480.20, marketCap: 210000, pe: 42.5, eps: 11.30 },
  };

  const base = demoData[symbol] || { name: symbol, industry: 'N/A', price: 100, marketCap: 50000, pe: 15, eps: 4 };
  const changePercent = (Math.random() - 0.5) * 4;
  const change = base.price * (changePercent / 100);

  return {
    symbol,
    timestamp: new Date().toISOString(),
    name: base.name,
    logo: null,
    industry: base.industry,
    exchange: 'NASDAQ',
    country: 'US',
    weburl: null,
    price: parseFloat(base.price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    high: parseFloat((base.price * 1.02).toFixed(2)),
    low: parseFloat((base.price * 0.98).toFixed(2)),
    open: parseFloat((base.price - change * 0.5).toFixed(2)),
    previousClose: parseFloat((base.price - change).toFixed(2)),
    week52High: parseFloat((base.price * 1.25).toFixed(2)),
    week52Low: parseFloat((base.price * 0.75).toFixed(2)),
    marketCap: base.marketCap,
    peRatio: base.pe,
    eps: base.eps,
    dividendYield: 0.5,
    beta: 1.2,
    strongBuy: 15,
    buy: 20,
    hold: 8,
    sell: 2,
    strongSell: 1,
    targetHigh: parseFloat((base.price * 1.35).toFixed(2)),
    targetLow: parseFloat((base.price * 0.85).toFixed(2)),
    targetMean: parseFloat((base.price * 1.15).toFixed(2)),
    isDemo: true,
    note: 'Demo data - Add FINNHUB_API_KEY to .env.local for real data'
  };
}
