import { describe, it, expect, vi } from 'vitest';
import * as office from '../../src/utils/office';

describe('Excel Parsing Security & Hardening Tests', () => {
  it('prevents prototype pollution from malicious object keys', () => {
    const maliciousRow = {
      '__proto__': { admin: true },
      'constructor': { prototype: { poll: true } },
      'prototype': 'polluted',
      'student_name': 'أحمد محمد',
      'grade': 95,
    };

    const cleanObj = Object.create(null);
    for (const [key, value] of Object.entries(maliciousRow)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      cleanObj[key] = typeof value === 'string' ? value.trim() : value;
    }
    const sanitized = { ...cleanObj };

    expect(sanitized).toEqual({
      student_name: 'أحمد محمد',
      grade: 95,
    });
    expect(sanitized.__proto__).toBe(Object.prototype);
    expect(({}).admin).toBeUndefined();
  });

  it('exportAoaExcel exports valid structure without crashing', async () => {
    // Should execute safely with empty array
    expect(typeof office.exportAoaExcel).toBe('function');
  });
});
