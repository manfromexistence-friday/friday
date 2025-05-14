import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }
  
  try {
    // Google's suggestion API URL
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Format the response data
    // The API returns an array where the second element contains the suggestions
    const suggestions = data[1].slice(0, 10).map((suggestion: string) => {
      return {
        id: suggestion,
        query: suggestion
      };
    });
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
