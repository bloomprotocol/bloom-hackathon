#!/usr/bin/env node

/**
 * Figma Assets Verification Script
 *
 * This script helps verify that all assets from a Figma design have been downloaded.
 *
 * Usage:
 *   node scripts/verify-figma-assets.js <component-name>
 *
 * Example:
 *   node scripts/verify-figma-assets.js seed-certificate
 */

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2] || 'seed-certificate';

console.log(`🔍 Verifying assets for: ${componentName}\n`);

// Read the component file
const componentPath = path.join(__dirname, '../src/components/certificates');
const files = fs.readdirSync(componentPath).filter(f => f.endsWith('.tsx'));

console.log('📁 Found component files:');
files.forEach(f => console.log(`   - ${f}`));
console.log();

// Check public/certificates directory
const assetsDir = path.join(__dirname, '../public/certificates');
if (!fs.existsSync(assetsDir)) {
  console.error('❌ Assets directory not found: public/certificates');
  process.exit(1);
}

const assets = fs.readdirSync(assetsDir);
console.log('🖼️  Found assets:');

const pngAssets = assets.filter(f => f.endsWith('.png'));
const svgAssets = assets.filter(f => f.endsWith('.svg'));

console.log(`\n  PNG Images (${pngAssets.length}):`);
pngAssets.forEach(f => console.log(`   - ${f}`));

console.log(`\n  SVG Images (${svgAssets.length}):`);
svgAssets.forEach(f => console.log(`   - ${f}`));

// Read component code and extract Image src references
console.log('\n🔗 Checking for missing assets...\n');

let allAssetsFound = true;

files.forEach(file => {
  const content = fs.readFileSync(path.join(componentPath, file), 'utf8');
  const srcMatches = content.match(/src=["']\/certificates\/([^"']+)["']/g);

  if (!srcMatches) {
    console.log(`⚠️  No assets found in ${file}`);
    return;
  }

  const referencedAssets = srcMatches.map(match => {
    const parts = match.match(/src=["']\/certificates\/([^"']+)["']/);
    return parts ? parts[1] : null;
  }).filter(Boolean);

  console.log(`📄 ${file}:`);
  referencedAssets.forEach(asset => {
    const exists = assets.includes(asset);
    if (exists) {
      console.log(`   ✅ ${asset}`);
    } else {
      console.log(`   ❌ MISSING: ${asset}`);
      allAssetsFound = false;
    }
  });
  console.log();
});

if (allAssetsFound) {
  console.log('✅ All assets found!');
  process.exit(0);
} else {
  console.log('❌ Some assets are missing. Please download them from Figma.');
  process.exit(1);
}
