import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { secureBuildEnv } from './build-secure.mjs';

// Exercise the actual installed transitive package with synthetic payloads.
// A future fixed release may safely return; today's package must fail closed.
const probe = `
  const assert = require('node:assert/strict');
  const merge = require('deepmerge');
  const payload = JSON.parse('{"__proto__":{"hmOsPoisoned":true}}');
  for (const [target, source] of [[Object.create(null), payload], [{session:null}, {session:payload}], [payload, {}]]) {
    try {
      const result = merge(target, source);
      assert.equal(result.hmOsPoisoned, undefined);
      assert.equal(result.session?.hmOsPoisoned, undefined);
    } catch (error) {
      if (error.code !== 'ERR_PROTO_ACCESS') throw error;
    }
  }
  assert.equal(({}).hmOsPoisoned, undefined);
`;
const result = spawnSync(process.execPath, ['-e', probe], {
  encoding: 'utf8', env: secureBuildEnv(),
});
assert.equal(result.status, 0, result.stderr || result.error?.message);
process.stdout.write('PASS: installed deepmerge prototype-poisoning probes blocked by secure build environment\n');
