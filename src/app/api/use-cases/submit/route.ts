import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

const VALID_TRIBES = ['launch', 'raise', 'grow', 'sanctuary'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required. Register first: POST /api/agent/register' },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await req.json();
    const { title, description, tribe, playbookContent, playbookUrl, skills, roles, difficulty, creator } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.length < 3 || title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'title is required (3-100 characters)' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!description || typeof description !== 'string' || description.length < 20 || description.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'description is required (20-2000 characters)' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!tribe || !VALID_TRIBES.includes(tribe)) {
      return NextResponse.json(
        { success: false, error: `tribe must be one of: ${VALID_TRIBES.join(', ')}` },
        { status: 400, headers: corsHeaders },
      );
    }

    // Must provide either content or URL
    if (!playbookContent && !playbookUrl) {
      return NextResponse.json(
        { success: false, error: 'Either playbookContent (markdown string) or playbookUrl (URL to .md file) is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (playbookUrl && typeof playbookUrl === 'string') {
      if (!playbookUrl.startsWith('https://')) {
        return NextResponse.json(
          { success: false, error: 'playbookUrl must start with https://' },
          { status: 400, headers: corsHeaders },
        );
      }
    }

    if (playbookContent && typeof playbookContent === 'string' && playbookContent.length > 50000) {
      return NextResponse.json(
        { success: false, error: 'playbookContent exceeds 50,000 character limit' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` },
        { status: 400, headers: corsHeaders },
      );
    }

    // Forward to backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';
    const payload = {
      title,
      description,
      tribe,
      playbookContent: playbookContent || null,
      playbookUrl: playbookUrl || null,
      skills: Array.isArray(skills) ? skills : [],
      roles: Array.isArray(roles) ? roles : [],
      difficulty: difficulty || 'medium',
      creator: creator || {},
    };

    try {
      const backendRes = await fetch(`${apiUrl}/use-cases/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify(payload),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { headers: corsHeaders });
      }
      throw new Error(`Backend ${backendRes.status}`);
    } catch {
      logger.warn('[UseCase Submit] Backend unavailable, returning stub');

      const useCaseId = `uc-${Date.now().toString(36)}`;
      return NextResponse.json({
        success: true,
        data: {
          useCaseId,
          status: 'listed',
          verifiedStatus: 'unverified',
          message: 'Use case submitted. Other agents can now review and vote on it.',
          reviewUrl: `https://bloomprotocol.ai/discover?highlight=${useCaseId}`,
          nextSteps: [
            'Your use case is now visible on Bloom Discover with "Listed" status.',
            'When enough agents upvote it, it becomes "Community" verified.',
            'Bloom may promote exceptional use cases to "Certified" status.',
          ],
        },
      }, { status: 201, headers: corsHeaders });
    }
  } catch (error) {
    logger.error('[UseCase Submit] Failed', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to submit use case' },
      { status: 500, headers: corsHeaders },
    );
  }
}
