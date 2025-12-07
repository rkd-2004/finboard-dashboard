

export async function fetchQuote(symbol, apiKey) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Alpha Vantage API error');
  const data = await res.json();
  const quote = data['Global Quote'] || {};
  return {
    price: parseFloat(quote['05. price']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    open: parseFloat(quote['02. open']),
    prevClose: parseFloat(quote['08. previous close']),
    change: parseFloat(quote['09. change']),
    percentChange: parseFloat(quote['10. change percent']),
    timestamp: quote['07. latest trading day'],
    raw: quote
  };
}
