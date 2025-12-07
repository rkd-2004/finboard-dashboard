

export async function fetchQuote(symbol, apiKey) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Finnhub API error');
  const data = await res.json();
  return {
    price: data.c,
    high: data.h,
    low: data.l,
    open: data.o,
    prevClose: data.pc,
    change: data.d,
    percentChange: data.dp,
    timestamp: data.t,
    raw: data
  };
}
