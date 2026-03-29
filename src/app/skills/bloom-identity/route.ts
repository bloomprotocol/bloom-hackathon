import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * GET /skills/bloom-identity
 *
 * Serves the Bloom Identity OpenClaw skill specification
 * This allows AI agents to read the skill and understand how to generate identity cards
 *
 * Accessible via:
 * - curl -s https://bloomprotocol.ai/skills/bloom-identity
 * - Direct browser access
 */
export async function GET(request: NextRequest) {
  try {
    // Path to SKILL.md in bloom-identity-skill project
    const skillPath = path.join(
      process.cwd(),
      '../bloom-identity-skill/SKILL.md'
    );

    // Read the skill file
    const content = await readFile(skillPath, 'utf-8');

    // Return with appropriate headers for agent consumption
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        // Suggest filename for download
        'Content-Disposition': 'inline; filename="bloom-identity.md"',
      },
    });
  } catch (error) {
    console.error('Error reading SKILL.md:', error);

    return NextResponse.json(
      {
        error: 'Skill not found',
        message: 'The Bloom Identity skill specification could not be loaded.',
        path: '../bloom-identity-skill/SKILL.md'
      },
      {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
