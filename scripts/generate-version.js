const fs = require('fs');
const path = require('path');
const outDir = path.resolve(__dirname, '..', 'html');
const outFile = path.join(outDir, 'version.json');
const now = new Date();
const payload = {
  version: Date.now(),
  builtAt: now.toISOString()
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
console.log(`[version] wrote ${outFile}:`, payload);
