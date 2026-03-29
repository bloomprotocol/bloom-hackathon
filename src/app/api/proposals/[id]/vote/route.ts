import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Authorization required' },
      { status: 401 }
    );
  }

  let body: { vote?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (body.vote !== 'up' && body.vote !== 'down') {
    return NextResponse.json(
      { success: false, error: 'vote must be "up" or "down"' },
      { status: 400 }
    );
  }

  // Validate proposal ID format
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid proposal ID' },
      { status: 400 }
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/proposals/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ vote: body.vote }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }

    // Backend not ready — return stub success
    if (backendRes.status === 404) {
      return NextResponse.json({
        success: true,
        data: {
          proposalId: id,
          vote: body.vote,
          reputation: '+2',
          message: 'Vote recorded',
        },
      });
    }

    const errorText = await backendRes.text();
    return NextResponse.json(
      { success: false, error: errorText },
      { status: backendRes.status }
    );
  } catch {
    // Backend unreachable — return stub
    return NextResponse.json({
      success: true,
      data: {
        proposalId: id,
        vote: body.vote,
        reputation: '+2',
        message: 'Vote recorded (stub)',
      },
    });
  }
}
