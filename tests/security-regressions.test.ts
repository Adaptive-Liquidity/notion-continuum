import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { redactLog } from '../src/security/redact.js';
import { fixture } from './implementation-helpers.js';
import { admin, gov } from './helpers.js';
let f: Awaited<ReturnType<typeof fixture>>;
before(async () => {
  f = await fixture('security-review');
});
after(async () => {
  if (f) await f.close();
  await Promise.all([admin.end(), gov.end()]);
});
test('future authentication time cannot manufacture fresh MFA authority', async () =>
  await assert.rejects(
    f.human.verify(
      await f.token('user', 'a', {
        auth_time: Math.floor(Date.now() / 1000) + 3600,
      }),
    ),
    /authentication time/,
  ));
test('SDK logs omit opaque task credentials and arbitrary exception contents', () => {
  const text = JSON.stringify(
    redactLog({
      taskToken: 'test-not-a-secret',
      nested: {
        authorization: 'test-not-a-secret',
        cookie: 'test-not-a-secret',
      },
      error: Error('test-not-a-secret'),
      operation: 'stable-operation',
      state: 'UNKNOWN',
    }),
  );
  assert.ok(!text.includes('test-not-a-secret'));
  assert.ok(text.includes('stable-operation'));
  assert.ok(text.includes('UNKNOWN'));
});
