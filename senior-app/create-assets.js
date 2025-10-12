const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1a1a1a"/>
  <circle cx="512" cy="400" r="120" fill="#4CAF50"/>
  <path d="M512 600c-80 0-150 50-180 120h360c-30-70-100-120-180-120z" fill="#4CAF50"/>
  <text x="512" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" fill="white">FB</text>
</svg>
`;

// Create splash screen SVG
const splashSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1a1a1a"/>
  <circle cx="512" cy="400" r="150" fill="#4CAF50"/>
  <path d="M512 600c-100 0-180 60-220 150h440c-40-90-120-150-220-150z" fill="#4CAF50"/>
  <text x="512" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" fill="white">FamilyBridge</text>
  <text x="512" y="900" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" fill="#ccc">Senior App</text>
</svg>
`;

// Create adaptive icon SVG
const adaptiveIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1a1a1a"/>
  <circle cx="512" cy="400" r="120" fill="#4CAF50"/>
  <path d="M512 600c-80 0-150 50-180 120h360c-30-70-100-120-180-120z" fill="#4CAF50"/>
  <text x="512" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" fill="white">FB</text>
</svg>
`;

// Create favicon SVG
const faviconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#1a1a1a"/>
  <circle cx="16" cy="12" r="4" fill="#4CAF50"/>
  <path d="M16 18c-2.5 0-4.5 1.5-5.5 3.5h11c-1-2-3-3.5-5.5-3.5z" fill="#4CAF50"/>
  <text x="16" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="white">FB</text>
</svg>
`;

// Write SVG files
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(__dirname, 'assets', 'splash.svg'), splashSvg);
fs.writeFileSync(path.join(__dirname, 'assets', 'adaptive-icon.svg'), adaptiveIconSvg);
fs.writeFileSync(path.join(__dirname, 'assets', 'favicon.svg'), faviconSvg);

console.log('✅ SVG assets created successfully!');
console.log('📱 You can convert these to PNG using online tools or ImageMagick:');
console.log('   - icon.svg → icon.png (1024x1024)');
console.log('   - splash.svg → splash.png (1024x1024)');
console.log('   - adaptive-icon.svg → adaptive-icon.png (1024x1024)');
console.log('   - favicon.svg → favicon.png (32x32)');
