import { NextRequest, NextResponse } from 'next/server';

// Helper function to aggressively clean text formatting
const cleanSuggestionText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/\r\n|\r|\n/g, ' ')    // Replace all types of line breaks with spaces
    .replace(/\s{2,}/g, ' ')        // Replace multiple spaces with a single space
    .replace(/\t/g, ' ')            // Replace tabs with spaces
    .replace(/\u00A0/g, ' ')        // Replace non-breaking spaces with regular spaces
    .trim();                        // Remove leading/trailing whitespace
}

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
    
    // Extract suggestions from the response and clean them thoroughly
    let suggestions = Array.isArray(data[1]) ? data[1] : [];
    
    // Process suggestions to ensure they're properly formatted using our more aggressive function
    suggestions = suggestions.map((suggestion: string) => cleanSuggestionText(suggestion))
      .filter(s => s.length > 0); // Remove any empty results after cleaning

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', message: (error as Error).message },
      { status: 500 }
    );
  }
}
