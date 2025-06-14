import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { month: string } }
) {
  try {
    // Get params in an async-safe way
    const { month: monthParam } = context.params;
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    console.log('API Route: Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const month = parseInt(monthParam, 10);
    console.log('API Route: Month parameter:', month);
    
    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month parameter' },
        { status: 400 }
      );
    }    // Forward the request to the backend API
    // Use hardcoded URL for testing
    const url = `http://localhost:5000/api/users/birthdays/${month}`;
    console.log('API Route: Forwarding request to:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
        },
      });

      console.log('API Route: Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API Route: Backend error response:', errorData);
        return NextResponse.json(
          { error: errorData.error || 'Failed to fetch birthday employees' },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('API Route: Received data for', data.length, 'employees');
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
