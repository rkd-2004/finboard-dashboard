

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    
    console.log('[Proxy] Fetching:', decodedUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinBoard/1.0',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('[Proxy] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[Proxy] Error response:', errorText);
      return Response.json(
        { error: `API returned ${response.status}: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log('[Proxy] Non-JSON response:', text.slice(0, 200));
      return Response.json(
        { error: 'API returned non-JSON response', raw: text.slice(0, 500) },
        { status: 500 }
      );
    }
    if (data.Note || data['Error Message'] || data.Information) {
      console.log('[Proxy] API error in response:', data);
      return Response.json(
        { 
          error: data.Note || data['Error Message'] || data.Information || 'API returned an error',
          apiResponse: data 
        },
        { status: 429 }
      );
    }
    
    return Response.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Proxy] Fetch error:', error.message);
    let errorMessage = error.message || 'Failed to fetch data';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. The external API may be slow or unreachable.';
    }
    
    return Response.json(
      { error: errorMessage, type: error.name },
      { status: 500 }
    );
  }
}
