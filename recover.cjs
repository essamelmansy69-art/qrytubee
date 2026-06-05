const { execSync } = require('child_process');
try {
  console.log("Searching for seoContent.ts...");
  const out = execSync('find / -name "seoContent.ts" 2>/dev/null', { encoding: 'utf8' });
  console.log("Found:", out);
} catch (err) {
  console.error("Error:", err.message);
}
