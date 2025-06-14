import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the current month (1-12)
    const currentMonth = new Date().getMonth() + 1;
    
    // Get month from query parameter or use current month as default
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || currentMonth.toString();
      // Get token from cookies using request object
    let token = request.cookies.get('token')?.value;
    
    // If token is not in cookies, check Authorization header as fallback
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
        // Get the API URL from environment or use a fallback
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const apiUrl = `${baseApiUrl}/leave/monthly?month=${month}`;    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 } // This replaces cache: 'no-store' in Next.js 13+
      });
          
      if (!response.ok) {        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || response.statusText || 'Unknown error' };
        }
        
        console.error(`API Route: Backend error: ${JSON.stringify(errorData)}`);
        return NextResponse.json(
          errorData,
          { status: response.status }
        );
      }      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('API Route: Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in leave requests API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}
