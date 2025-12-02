const fs = require('fs');
const path = require('path');

// Copy the generated OpenAPI file to the root backend directory
const sourcePath = path.join(__dirname, '../src/api/openapi.json');
const destPath = path.join(__dirname, '../openapi.json');

try {
  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ OpenAPI specification copied to root backend directory');
  console.log(`📄 Source: ${sourcePath}`);
  console.log(`📄 Destination: ${destPath}`);
} catch (error) {
  console.error('❌ Error copying OpenAPI specification:', error);
  process.exit(1);
}