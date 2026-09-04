const { execSync } = require('child_process');
try {
  console.log("Running git checkout...");
  const out = execSync('git checkout src/data/seoContent.ts', { encoding: 'utf8' });
  console.log("Output:", out);
} catch (err) {
  console.error("Error running command:", err.message, err.stdout, err.stderr);
}
