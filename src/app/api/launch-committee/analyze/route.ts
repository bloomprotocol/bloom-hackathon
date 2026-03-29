import { NextRequest, NextResponse } from 'next/server';
import { generateMockAnalysis } from '@/constants/launch-committee-mock-analysis';
import type { ProjectStatus } from '@/constants/launch-committee-types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const VALID_STATUSES: ProjectStatus[] = ['idea', 'mvp', 'paying_users', 'scaling'];
const MAX_SUBMISSIONS_PER_DAY = 3;

// In-memory rate limiter (resets on deploy). Fine for MVP.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= MAX_SUBMISSIONS_PER_DAY) return false;

  entry.count++;
  return true;
}

// Strip HTML tags from user input
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Login required to analyze your project.' },
        { status: 401, headers: corsHeaders },
      );
    }

    // Extract user ID from token (simplified — just use token hash as ID for rate limiting)
    const token = authHeader.slice(7);
    const userId = token.slice(0, 32);

    // Rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { success: false, error: 'You can submit up to 3 projects per day. Try again tomorrow.' },
        { status: 429, headers: corsHeaders },
      );
    }

    const body = await req.json();

    // Validate required fields
    const { project_name, description, problem, current_status, url } = body;

    if (!project_name || typeof project_name !== 'string' || project_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project name is required.' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (project_name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Project name must be 100 characters or less.' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Description is required.' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (description.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Description must be 500 characters or less.' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!problem || typeof problem !== 'string' || problem.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Problem statement is required.' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (problem.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Problem statement must be 500 characters or less.' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!current_status || !VALID_STATUSES.includes(current_status)) {
      return NextResponse.json(
        { success: false, error: 'Current status must be one of: idea, mvp, paying_users, scaling.' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (url && typeof url === 'string' && url.trim().length > 0 && !isValidUrl(url.trim())) {
      return NextResponse.json(
        { success: false, error: 'URL must start with http:// or https://' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Sanitize inputs
    const sanitizedInput = {
      project_name: sanitize(project_name),
      description: sanitize(description),
      problem: sanitize(problem),
      current_status: current_status as ProjectStatus,
      url: url ? sanitize(url) : undefined,
    };

    // Generate mock analysis
    const result = generateMockAnalysis(sanitizedInput);

    const reportId = `lr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: reportId,
          stage: result.stage,
          analysis: result.analysis,
          recommended_tribe: result.recommended_tribe,
          can_publish: result.can_publish,
          improvement_suggestions: result.improvement_suggestions,
        },
      },
      { headers: corsHeaders },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Analysis failed. Please try again.' },
      { status: 500, headers: corsHeaders },
    );
  }
}
