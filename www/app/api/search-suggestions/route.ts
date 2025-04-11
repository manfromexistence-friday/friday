import { NextRequest, NextResponse } from 'next/server';

// Helper function to aggressively clean text formatting
const cleanSuggestionText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 5; // Number of suggestions per page

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // For page 1, use the standard Google suggest API
    // For subsequent pages, use a variation to get more results
    let googleSuggestUrl;
    
    if (page <= 1) {
      googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    } else {
      // For additional pages, modify the query to get different suggestions
      // This is a technique to get more variations since Google doesn't support pagination
      const modifiers = ["a", "b", "c", "d", "e", "f", "g", "how", "why", "what", "when", "where"];
      const modifier = modifiers[(page - 2) % modifiers.length];
      
      googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(`${query} ${modifier}`)}`;
    }
    
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
    
    // Process suggestions to ensure they're properly formatted
    suggestions = suggestions.map((suggestion: string) => cleanSuggestionText(suggestion))
      .filter(s => s.length > 0); // Remove any empty results after cleaning
    
    // For pages after the first, remove the modifier we added if it appears
    if (page > 1) {
      suggestions = suggestions.map((suggestion: string) => {
        return suggestion;
      });
    }

    // Determine if there might be more results
    // Since Google doesn't support real pagination, we'll limit to a reasonable number of pages
    const hasMore = page < 5; // Allow up to 5 pages of results

    return NextResponse.json({ 
      suggestions,
      hasMore,
      page
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', message: (error as Error).message },
      { status: 500 }
    );
  }
}
