const test = require('node:test');
const assert = require('node:assert');
const app = require('./server');

test('health endpoint responds ok', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.deepStrictEqual(await res.json(), { ok: true });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});