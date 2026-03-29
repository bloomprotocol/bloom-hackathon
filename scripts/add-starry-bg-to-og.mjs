import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ogDir = join(__dirname, '../public/og');

const personalities = ['innovator', 'explorer', 'cultivator', 'optimizer', 'visionary'];

async function addStarryBackground(personality) {
  try {
    const originalPath = join(ogDir, `${personality}-backup.png`);
    const bgPath = join(ogDir, `${personality}-agent-bg copy.png`);
    const outputPath = join(ogDir, `${personality}.png`);

    console.log(`🎨 Processing ${personality}...`);

    // Read original card design (foreground)
    const original = await sharp(originalPath).toBuffer();

    // Resize background to 1200x630 (crop center)
    const background = await sharp(bgPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // Composite: background + original card on top
    await sharp(background)
      .composite([
        {
          input: original,
          blend: 'over' // Original card on top of background
        }
      ])
      .toFile(outputPath);

    console.log(`   ✅ ${personality}.png updated with starry background`);
  } catch (error) {
    console.error(`   ❌ Error processing ${personality}:`, error.message);
  }
}

async function main() {
  console.log('🌟 Adding starry backgrounds to OG images...\n');

  for (const personality of personalities) {
    await addStarryBackground(personality);
  }

  console.log('\n✨ All done!');
}

main();
