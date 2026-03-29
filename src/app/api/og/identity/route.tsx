import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Tier configuration
const TIER_CONFIG: Record<string, { gradient: string; icon: string; frameGradient: string }> = {
  New: {
    gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)',
    icon: '✨',
    frameGradient: 'linear-gradient(135deg, rgba(156,163,175,0.3), transparent, rgba(156,163,175,0.2))',
  },
  Seed: {
    gradient: 'linear-gradient(135deg, #34d399, #10b981)',
    icon: '🌱',
    frameGradient: 'linear-gradient(135deg, rgba(16,185,129,0.3), transparent, rgba(16,185,129,0.2))',
  },
  Sprout: {
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    icon: '🌿',
    frameGradient: 'linear-gradient(135deg, rgba(139,92,246,0.3), transparent, rgba(139,92,246,0.2))',
  },
  Bloom: {
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    icon: '🌸',
    frameGradient: 'linear-gradient(135deg, rgba(251,191,36,0.3), transparent, rgba(251,191,36,0.2))',
  },
};

// Generate a short ID from string (for display)
function generateShortId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().slice(0, 8).padStart(8, '0');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tier = searchParams.get('tier') || 'Seed';
  const personality = searchParams.get('personality') || 'The Explorer';
  const description = searchParams.get('description') || 'Curious about everything';
  const categoriesStr = searchParams.get('categories') || '';
  const since = searchParams.get('since') || '';

  // Parse categories from comma-separated string like "🤖AI,⚡Productivity"
  const categories = categoriesStr ? categoriesStr.split(',').slice(0, 3) : [];

  // Extract category labels (remove emoji prefix)
  const categoryLabels = categories.map(cat => {
    // Remove leading emoji (first 1-2 characters that are emoji)
    return cat.replace(/^[\p{Emoji}]+/u, '').trim();
  });

  // Generate dynamic insight
  let dynamicInsight = description; // fallback to description
  if (categoryLabels.length > 0) {
    const firstCat = categoryLabels[0].toLowerCase();
    if (categoryLabels.length > 1) {
      const secondCat = categoryLabels[1].toLowerCase();
      dynamicInsight = `You back ${firstCat} & ${secondCat} projects`;
    } else {
      dynamicInsight = `You back ${firstCat} projects`;
    }
  }

  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.Seed;

  // Generate card ID
  const cardId = generateShortId(personality + since + tier);

  // Format member since date
  let memberSince = '';
  if (since) {
    try {
      const date = new Date(since);
      memberSince = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      memberSince = '';
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200',
          height: '630',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
        }}
      >
        {/* 3D Frame - Outer shadow */}
        <div
          style={{
            position: 'absolute',
            width: '440',
            height: '540',
            borderRadius: '32px',
            background: tierConfig.frameGradient,
            transform: 'translate(8px, 8px)',
            filter: 'blur(2px)',
          }}
        />

        {/* Card */}
        <div
          style={{
            width: '440',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px',
            borderRadius: '32px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(240,235,255,0.95) 50%, rgba(255,245,250,0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          {/* Holographic overlay effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '32px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, rgba(200,220,255,0.15) 60%, transparent 100%)',
            }}
          />

          {/* Card Header - ID Style */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#9ca3af',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              SUPPORTER ID
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '11px',
                color: '#9ca3af',
                fontFamily: 'monospace',
              }}
            >
              #{cardId}
            </div>
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, #e5e7eb, #d1d5db, #e5e7eb)',
              marginBottom: '24px',
            }}
          />

          {/* Icon */}
          <div style={{ fontSize: '56px', marginBottom: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
            {tierConfig.icon}
          </div>

          {/* Tier Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                padding: '10px 24px',
                borderRadius: '999px',
                background: tierConfig.gradient,
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              {tier}
            </div>
          </div>

          {/* Personality */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {personality}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {dynamicInsight}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(243, 244, 246, 0.9)',
                    fontSize: '13px',
                    color: '#374151',
                    fontWeight: '500',
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}

          {/* Member since */}
          {memberSince && (
            <div
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginBottom: '16px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              Member since {memberSince}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(209,213,219,0.5), transparent)',
              marginBottom: '16px',
            }}
          />

          {/* Branding with slogan */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: '14px', color: '#4b5563', fontWeight: '600', letterSpacing: '0.02em' }}>
              bloomprotocol.ai
            </div>
            <div style={{ display: 'flex', fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
              Discover. Support. Bloom.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
