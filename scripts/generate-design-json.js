#!/usr/bin/env node

/**
 * CLI tool to generate design JSON from Figma certificates
 *
 * Usage:
 *   node scripts/generate-design-json.js
 *   node scripts/generate-design-json.js seed
 *   node scripts/generate-design-json.js all
 */

const fs = require('fs');
const path = require('path');

const certificateDesigns = {
  seed: {
    component: 'SeedPassCertificate',
    variant: 'seed',
    figmaNodeId: '1789:49345',
    size: {
      width: '272px',
      height: '320px',
      borderRadius: '16px',
    },
    design: {
      title: 'Seed',
      level: 'L1',
      subtitle: 'Early Seed Supporter',
      colors: {
        gradient: {
          description: 'From warm brown to purple tones',
          top: '#DAA57D',
          middle: '#98798D',
          bottom: '#5B4662',
          cssValue: 'linear-gradient(180deg, rgba(218, 165, 125, 0.9) 0%, rgba(152, 121, 141, 0.9) 50%, rgba(91, 70, 98, 0.95) 100%)',
        },
        text: '#FFFFFF',
        textOpacity: {
          title: '100%',
          level: '90%',
          subtitle: '80%',
          badge: '70%',
        },
        shadow: {
          value: 'rgba(152, 121, 141, 0.4)',
          description: 'Soft purple shadow for depth',
        },
      },
      typography: {
        title: {
          text: 'Seed',
          font: 'Serif',
          size: '40px',
          weight: '500',
          lineHeight: '1.1',
        },
        level: {
          text: 'L1',
          font: 'Outfit',
          size: '32px',
          weight: '500',
          lineHeight: '1',
        },
        subtitle: {
          text: 'Early Seed Supporter',
          font: 'Outfit',
          size: '14px',
          weight: '300',
          lineHeight: '1.2',
        },
        badge: {
          text: 'Certificate',
          font: 'Outfit',
          size: '11px',
          weight: '500',
          letterSpacing: 'wide',
        },
      },
      decorations: {
        icon: {
          type: 'plant-sprout',
          size: '32px',
          color: 'white',
          position: 'top-right',
        },
        branches: {
          description: 'Tree branch pattern overlay',
          opacity: '30%',
          color: 'white',
        },
        badge: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          blur: 'backdrop-blur-sm',
          position: 'bottom-right',
        },
      },
    },
  },
  sprout: {
    component: 'SeedPassCertificate',
    variant: 'sprout',
    figmaNodeId: '1789:49356',
    size: {
      width: '272px',
      height: '320px',
      borderRadius: '16px',
    },
    design: {
      title: 'Sprout',
      level: 'L2',
      subtitle: 'Activated Sprout Supporter',
      colors: {
        gradient: {
          description: 'Fresh green gradient like growing plants',
          top: '#90EECD',
          middle: '#56B49B',
          bottom: '#2D6059',
          cssValue: 'linear-gradient(180deg, rgba(144, 238, 205, 0.9) 0%, rgba(86, 180, 155, 0.9) 50%, rgba(45, 96, 89, 0.95) 100%)',
        },
        text: '#FFFFFF',
        textOpacity: {
          title: '100%',
          level: '90%',
          subtitle: '80%',
          badge: '70%',
        },
        shadow: {
          value: 'rgba(86, 180, 155, 0.4)',
          description: 'Soft teal shadow for depth',
        },
      },
      typography: {
        title: {
          text: 'Sprout',
          font: 'Serif',
          size: '40px',
          weight: '500',
          lineHeight: '1.1',
        },
        level: {
          text: 'L2',
          font: 'Outfit',
          size: '32px',
          weight: '500',
          lineHeight: '1',
        },
        subtitle: {
          text: 'Activated Sprout Supporter',
          font: 'Outfit',
          size: '14px',
          weight: '300',
          lineHeight: '1.2',
        },
        badge: {
          text: 'Certificate',
          font: 'Outfit',
          size: '11px',
          weight: '500',
          letterSpacing: 'wide',
        },
      },
      decorations: {
        icon: {
          type: 'plant-sprout',
          size: '32px',
          color: 'white',
          position: 'top-right',
        },
        branches: {
          description: 'Tree branch pattern overlay',
          opacity: '30%',
          color: 'white',
        },
        badge: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          blur: 'backdrop-blur-sm',
          position: 'bottom-right',
        },
      },
    },
  },
  bloom: {
    component: 'SeedPassCertificate',
    variant: 'bloom',
    figmaNodeId: '1789:49369',
    size: {
      width: '272px',
      height: '320px',
      borderRadius: '16px',
    },
    design: {
      title: 'Bloom',
      level: 'L3',
      subtitle: 'Bloom Supporter',
      colors: {
        gradient: {
          description: 'Deep purple gradient representing full bloom',
          top: '#1A1932',
          middle: '#342C58',
          bottom: '#7851A9',
          cssValue: 'linear-gradient(180deg, rgba(26, 25, 50, 0.95) 0%, rgba(52, 44, 88, 0.9) 50%, rgba(120, 81, 169, 0.9) 100%)',
        },
        text: '#FFFFFF',
        textOpacity: {
          title: '100%',
          level: '90%',
          subtitle: '80%',
          badge: '70%',
        },
        shadow: {
          value: 'rgba(120, 81, 169, 0.4)',
          description: 'Soft purple shadow for depth',
        },
      },
      typography: {
        title: {
          text: 'Bloom',
          font: 'Serif',
          size: '40px',
          weight: '500',
          lineHeight: '1.1',
        },
        level: {
          text: 'L3',
          font: 'Outfit',
          size: '32px',
          weight: '500',
          lineHeight: '1',
        },
        subtitle: {
          text: 'Bloom Supporter',
          font: 'Outfit',
          size: '14px',
          weight: '300',
          lineHeight: '1.2',
        },
        badge: {
          text: 'Certificate',
          font: 'Outfit',
          size: '11px',
          weight: '500',
          letterSpacing: 'wide',
        },
      },
      decorations: {
        icon: {
          type: 'plant-sprout',
          size: '32px',
          color: 'white',
          position: 'top-right',
        },
        branches: {
          description: 'Tree branch pattern overlay',
          opacity: '30%',
          color: 'white',
        },
        badge: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          blur: 'backdrop-blur-sm',
          position: 'bottom-right',
        },
      },
    },
  },
};

// Get command line argument
const args = process.argv.slice(2);
const level = args[0] || 'all';

// Output directory
const outputDir = path.join(__dirname, '../design-specs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (level === 'all') {
  // Generate all certificates
  const allDesigns = {
    project: 'Bloom Protocol - Seed Pass Certificates',
    description: 'Design specifications for three levels of Seed Pass certificates',
    created: new Date().toISOString(),
    figmaUrl: 'https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49344',
    certificates: certificateDesigns,
  };

  const outputPath = path.join(outputDir, 'seed-pass-certificates.json');
  fs.writeFileSync(outputPath, JSON.stringify(allDesigns, null, 2));
  console.log(`✅ Generated all certificates: ${outputPath}`);
} else if (certificateDesigns[level]) {
  // Generate single certificate
  const outputPath = path.join(outputDir, `certificate-${level}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(certificateDesigns[level], null, 2));
  console.log(`✅ Generated ${level} certificate: ${outputPath}`);
} else {
  console.error(`❌ Unknown level: ${level}`);
  console.log('Usage: node scripts/generate-design-json.js [seed|sprout|bloom|all]');
  process.exit(1);
}
