import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {    // Get the month from the query parameters
    const requestUrl = new URL(request.url);
    let monthParam = requestUrl.searchParams.get('month');
    
    // Check if we're getting a path param due to any route fallback from [month] pattern
    // This is a safety mechanism in case the routing still catches the [month] pattern
    if (!monthParam) {
      const pathMatch = request.url.match(/\/birthdays\/(\d+)/);
      if (pathMatch && pathMatch[1]) {
        monthParam = pathMatch[1];
      }
    }
    const authHeader = request.headers.get('authorization');    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!monthParam) {
      return NextResponse.json(
        { error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const month = parseInt(monthParam, 10);
    
    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month parameter' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend API
    // Use hardcoded URL for testing
    const url = `http://localhost:5000/api/users/birthdays/${month}`;    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API Route: Backend error response:', errorData);
        return NextResponse.json(
          { error: errorData.error || 'Failed to fetch birthday employees' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('API Route: Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in birthday employees API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
