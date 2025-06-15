import { NextRequest, NextResponse } from 'next/server';

// For Next.js 15.3.2 app router pattern
interface Params {
  params: {
    month: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Get params in an async-safe way
    const monthParam = params.month;
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const month = parseInt(monthParam, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month parameter' },
        { status: 400 }
      );    }    // Forward the request to the backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = `${API_URL}/users/birthdays/${month}`;
    
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
