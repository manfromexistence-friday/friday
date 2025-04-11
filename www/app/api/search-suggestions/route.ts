import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Google's suggestion API URL
    const googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(googleSuggestUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Google');
    }

    // Google returns data as [query, [suggestions]]
    const data = await response.json();
    
    // Extract suggestions from the response
    const suggestions = data[1];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', message: (error as Error).message },
      { status: 500 }
    );
  }
}
