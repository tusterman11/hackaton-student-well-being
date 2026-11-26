const test = require('node:test');
const assert = require('node:assert');
const { generateText, isConfigured } = require('./gemini');

function withFetch(fakeFetch, run) {
  const original = global.fetch;
  global.fetch = fakeFetch;
  return Promise.resolve(run()).finally(() => {
    global.fetch = original;
  });
}

test('isConfigured follows the GEMINI_API_KEY variable', () => {
  const original = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  assert.strictEqual(isConfigured(), false);
  process.env.GEMINI_API_KEY = 'test-key';
  assert.strictEqual(isConfigured(), true);
  if (original === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = original;
});

test('generateText sends the conversation and returns the reply text', async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  let captured;
  await withFetch(async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Beba água.' }, { text: 'Respire.', thought: true }] } }],
      }),
    };
  }, async () => {
    const text = await generateText({
      system: 'regras',
      messages: [
        { role: 'user', content: 'oi' },
        { role: 'assistant', content: 'olá' },
        { role: 'user', content: 'tudo bem?' },
      ],
      maxOutputTokens: 100,
    });
    assert.strictEqual(text, 'Beba água.');
  });

  assert.ok(captured.url.includes(':generateContent'));
  assert.strictEqual(captured.options.headers['x-goog-api-key'], 'test-key');
  const body = JSON.parse(captured.options.body);
  assert.strictEqual(body.system_instruction.parts[0].text, 'regras');
  assert.deepStrictEqual(body.contents.map((item) => item.role), ['user', 'model', 'user']);
  assert.strictEqual(body.generationConfig.maxOutputTokens, 100);
});

test('generateText returns an empty string when the model returns no text', async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  await withFetch(async () => ({ ok: true, json: async () => ({ candidates: [] }) }), async () => {
    const text = await generateText({ system: 's', messages: [{ role: 'user', content: 'oi' }], maxOutputTokens: 10 });
    assert.strictEqual(text, '');
  });
});

test('generateText throws an error with the HTTP status when the API fails', async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  await withFetch(async () => ({ ok: false, status: 429 }), async () => {
    await assert.rejects(
      () => generateText({ system: 's', messages: [{ role: 'user', content: 'oi' }], maxOutputTokens: 10 }),
      (error) => error.status === 429
    );
  });
});
