import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, description, url, email, twitter, linkedin } = body;

    // Basic validation
    if (!projectName || !description || !url || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendResponse = await fetch(`${API_BASE_URL}/builder/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName,
        description,
        url,
        email,
        twitter: twitter || undefined,
        linkedin: linkedin || undefined,
      }),
    });

    const result = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend API error:', result);
      return NextResponse.json(
        {
          error: result.message || 'Failed to submit builder application',
          success: false,
        },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Builder submission successful:', {
      projectName,
      email,
      submissionId: result.data?.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Thank you for your submission! We will review and get back to you soon.',
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error processing builder submission:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
