import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

// CORS headers for cross-origin agent access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, capabilities, platform, ownerEmail, ownerHandle } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 64) {
      return NextResponse.json(
        { success: false, error: 'name is required (1-64 chars)' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!description || typeof description !== 'string' || description.length > 500) {
      return NextResponse.json(
        { success: false, error: 'description is required (max 500 chars)' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!Array.isArray(capabilities) || capabilities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'capabilities must be a non-empty array' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Forward to NestJS backend if available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

    try {
      const payload: Record<string, unknown> = {
          name,
          description,
          capabilities,
          platform: platform || 'other',
        };
      if (ownerEmail) payload.ownerEmail = ownerEmail;
      if (ownerHandle) payload.ownerHandle = ownerHandle;

      const backendRes = await fetch(`${apiUrl}/agent/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { headers: corsHeaders });
      }
      throw new Error(`Backend returned ${backendRes.status}`);
    } catch (backendErr) {
      // Backend unavailable — return error (no more stub data)
      logger.warn('[AgentRegister] Backend unavailable', { backendErr });

      return NextResponse.json(
        { success: false, error: 'Registration service temporarily unavailable. Please try again.' },
        { status: 503, headers: corsHeaders },
      );
    }
  } catch (error) {
    logger.error('[AgentRegister] Registration failed', { error });
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500, headers: corsHeaders },
    );
  }
}
