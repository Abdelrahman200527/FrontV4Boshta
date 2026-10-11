import { describe, it, expect, beforeEach } from 'vitest';
import { setCookie, getCookie, deleteCookie, clearAllAuthCookies } from '../../src/utils/cookies';

describe('Cookies & Token Management Security', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [key] = c.trim().split('=');
      if (key) {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      }
    }
  });

  it('sets and retrieves a cookie with strict URI encoding', () => {
    setCookie('test_token', 'abc-123_xyz', 1);
    expect(getCookie('test_token')).toBe('abc-123_xyz');
  });

  it('handles Arabic values and complex characters safely without corruption', () => {
    const complexJson = JSON.stringify({ name: 'أحمد محمود', role: 'طالب' });
    setCookie('user_data', complexJson, 7);
    const retrieved = getCookie('user_data');
    expect(retrieved).toBe(complexJson);
    const parsed = JSON.parse(retrieved);
    expect(parsed.name).toBe('أحمد محمود');
    expect(parsed.role).toBe('طالب');
  });

  it('deletes a specific cookie by expiring it', () => {
    setCookie('session_id', 'sess_999', 1);
    expect(getCookie('session_id')).toBe('sess_999');
    deleteCookie('session_id');
    expect(getCookie('session_id')).toBeNull();
  });

  it('clearAllAuthCookies purges auth_token, user_data, and super_admin_key simultaneously', () => {
    setCookie('auth_token', 'jwt_secret_token_123', 7);
    setCookie('user_data', JSON.stringify({ id: 1, full_name: 'Super Admin' }), 7);
    setCookie('super_admin_key', 'admin_secret_key_abc', 7);

    expect(getCookie('auth_token')).toBe('jwt_secret_token_123');
    expect(getCookie('user_data')).not.toBeNull();
    expect(getCookie('super_admin_key')).toBe('admin_secret_key_abc');

    clearAllAuthCookies();

    expect(getCookie('auth_token')).toBeNull();
    expect(getCookie('user_data')).toBeNull();
    expect(getCookie('super_admin_key')).toBeNull();
  });

  it('returns null for non-existent cookie keys', () => {
    expect(getCookie('non_existent_key_xyz')).toBeNull();
  });
});
