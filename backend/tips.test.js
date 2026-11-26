const test = require('node:test');
const assert = require('node:assert');

delete process.env.GEMINI_API_KEY;
const { getTip } = require('./tips');

test('low mood shows support resources and skips the AI', async () => {
  const result = await getTip({ mood: 1, energy: 3 });
  assert.strictEqual(result.showSupport, true);
  assert.strictEqual(result.source, 'safety');
});

test('without an API key it falls back to a hand-written tip', async () => {
  const result = await getTip({ mood: 4, energy: 3 });
  assert.strictEqual(result.showSupport, false);
  assert.strictEqual(result.source, 'fallback');
  assert.ok(result.tip.length > 0);
});
