import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const backendUrl = `${API_URL}/users/update/${params.id}`;
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json({ error: errorData.error }, { status: response.status });
      } catch {
        return NextResponse.json({ error: 'Backend error' }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${API_URL}/users/${params.id}`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json({ error: errorData.error }, { status: response.status });
      } catch {
        return NextResponse.json({ error: 'Backend error' }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
