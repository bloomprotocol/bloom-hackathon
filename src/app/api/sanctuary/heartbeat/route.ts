/**
 * POST /api/sanctuary/heartbeat
 *
 * Anonymous usage heartbeat. NOT x402 protected (free).
 * Only receives: { used: true, theme: "council" | "zen" }
 * No conversation content, no personal data.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { used, theme } = body;

    if (!used || !["council", "zen"].includes(theme)) {
      return NextResponse.json(
        { error: "Invalid heartbeat" },
        { status: 400 }
      );
    }

    // Log anonymously (no user data)
    logger.info("[Sanctuary Heartbeat]", { theme, timestamp: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
