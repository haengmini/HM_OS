import { describe, expect, it } from 'vitest';
import { buildServer } from './server.js';

describe('GET /healthz', () => {
  it('returns ok status without requiring auth (public health probe only)', async () => {
    const app = buildServer();
    const response = await app.inject({ method: 'GET', url: '/healthz' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('hm-os-api');
  });
});
