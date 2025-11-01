import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forward to backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8800';

        // Get the authorization token from the request
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${backendUrl}/api/system/contracts/deploy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader })
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Contract deploy API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}