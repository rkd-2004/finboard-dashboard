
import { fetchQuote as fetchFinnhubQuote } from '@/adapters/finnhubAdapter';
import { fetchQuote as fetchAlphaVantageQuote } from '@/adapters/alphaVantageAdapter';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const provider = searchParams.get('provider') || 'finnhub';
  let apiKey;
  let data;
  try {
    if (!symbol) {
      return Response.json({ error: 'Missing symbol' }, { status: 400 });
    }
    if (provider === 'finnhub') {
      apiKey = process.env.FINNHUB_API_KEY;
      if (!apiKey) return Response.json({ error: 'Missing Finnhub API key' }, { status: 400 });
      data = await fetchFinnhubQuote(symbol, apiKey);
    } else if (provider === 'alphavantage') {
      apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) return Response.json({ error: 'Missing Alpha Vantage API key' }, { status: 400 });
      data = await fetchAlphaVantageQuote(symbol, apiKey);
    } else {
      return Response.json({ error: 'Unknown provider' }, { status: 400 });
    }
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message, provider, symbol }, { status: 500 });
  }
}
