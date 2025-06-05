import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }    // Forward the request to the backend server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });

    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('Received HTML response instead of JSON:', htmlText.substring(0, 200));
      return NextResponse.json({ error: 'Server returned an error page' }, { status: 500 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Avatar delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
