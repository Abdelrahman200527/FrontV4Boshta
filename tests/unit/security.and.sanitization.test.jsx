import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MarkdownRenderer from '../../src/components/MarkdownRenderer';
import getImageUrl from '../../src/utils/imageUrl';

describe('Frontend Security & XSS Sanitization Tests', () => {
  describe('MarkdownRenderer (DOMPurify protection)', () => {
    it('sanitizes <script> tags from user/AI generated markdown', () => {
      const maliciousInput = "مرحبا **بالطلاب** <script>window.__pwned = true;</script>";
      const { container } = render(<MarkdownRenderer content={maliciousInput} />);

      expect(container.querySelector('script')).toBeNull();
      expect(window.__pwned).toBeUndefined();
      expect(container.textContent).toContain('مرحبا');
      expect(container.textContent).toContain('بالطلاب');
    });

    it('sanitizes inline event handlers like onerror and onload', () => {
      const maliciousInput = '<img src="nonexistent.png" onerror="alert(\'XSS\')" alt="test image" />';
      const { container } = render(<MarkdownRenderer content={maliciousInput} />);

      const img = container.querySelector('img');
      if (img) {
        expect(img.getAttribute('onerror')).toBeNull();
      }
    });

    it('adds target="_blank" and rel="noopener noreferrer" to external markdown links', () => {
      const markdownWithLink = '[اضغط هنا للمصدر](https://example.com/notes)';
      const { container } = render(<MarkdownRenderer content={markdownWithLink} />);

      const anchor = container.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor.getAttribute('href')).toBe('https://example.com/notes');
      expect(anchor.getAttribute('target')).toBe('_blank');
      expect(anchor.getAttribute('rel')).toContain('noopener');
      expect(anchor.getAttribute('rel')).toContain('noreferrer');
    });
  });

  describe('getImageUrl protocol sanitization', () => {
    it('blocks dangerous javascript: pseudo-protocol URLs', () => {
      const result = getImageUrl('javascript:alert(document.cookie)');
      expect(result).toBeNull();
    });

    it('blocks dangerous vbscript: pseudo-protocol URLs', () => {
      const result = getImageUrl('vbscript:msgbox(1)');
      expect(result).toBeNull();
    });

    it('preserves valid safe protocols (https, blob, data)', () => {
      expect(getImageUrl('https://example.com/photo.png')).toBe('https://example.com/photo.png');
      expect(getImageUrl('blob:http://localhost/uuid-123')).toBe('blob:http://localhost/uuid-123');
      expect(getImageUrl('data:image/png;base64,iVBORw0KGgo')).toBe('data:image/png;base64,iVBORw0KGgo');
    });

    it('returns null on null, undefined, or empty path', () => {
      expect(getImageUrl(null)).toBeNull();
      expect(getImageUrl(undefined)).toBeNull();
      expect(getImageUrl('')).toBeNull();
    });
  });
});
