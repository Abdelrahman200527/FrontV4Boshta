import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cookies from '../../src/utils/cookies';
import { httpGet, httpPost } from '../../src/api/http';

describe('HTTP Client & API Integration Contract Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches basic auth and x-client-key when auth_token is present', async () => {
    vi.spyOn(cookies, 'getCookie').mockImplementation((name) => {
      if (name === 'auth_token') return 'mock_token_abc';
      if (name === 'super_admin_key') return 'mock_admin_key_xyz';
      return null;
    });

    let capturedHeaders = null;
    global.fetch = vi.fn().mockImplementation((url, options) => {
      capturedHeaders = options.headers;
      return Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });
    });

    const res = await httpGet('/students');
    expect(res).toEqual({ success: true, data: [] });
    expect(capturedHeaders['Authorization']).toMatch(/^Basic /);
    expect(capturedHeaders['x-client-key']).toBe('mock_token_abc');
    expect(capturedHeaders['x-super-admin-key']).toBe('mock_admin_key_xyz');
    expect(capturedHeaders['Content-Type']).toBe('application/json');
  });

  it('triggers forceLogout and purges auth cookies on 401 Unauthorized', async () => {
    const clearAuthCookiesSpy = vi.spyOn(cookies, 'clearAllAuthCookies');

    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ success: false, message: 'انتهت الجلسة' }),
    });

    await expect(httpGet('/protected-resource')).rejects.toThrow('انتهت الجلسة');
    expect(clearAuthCookiesSpy).toHaveBeenCalled();
  });

  it('triggers forceLogout on 403 Forbidden when force_logout flag is true', async () => {
    const clearAuthCookiesSpy = vi.spyOn(cookies, 'clearAllAuthCookies');

    global.fetch = vi.fn().mockResolvedValue({
      status: 403,
      ok: false,
      json: () => Promise.resolve({ success: false, force_logout: true, message: 'المنصة متوقفة مؤقتاً' }),
    });

    await expect(httpGet('/dashboard')).rejects.toThrow('المنصة متوقفة مؤقتاً');
    expect(clearAuthCookiesSpy).toHaveBeenCalled();
  });

  it('returns null on 204 No Content responses without failing JSON parse', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 204,
      ok: true,
      json: () => Promise.reject(new Error('Should not parse JSON on 204')),
    });

    const res = await httpPost('/items/123/toggle', {});
    expect(res).toBeNull();
  });
});
