import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../src/components/ErrorBoundary';

function ProblemChild({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Simulated runtime component crash');
  }
  return <div>Everything is working smoothly</div>;
}

describe('ErrorBoundary Component Tests', () => {
  beforeEach(() => {
    // Suppress expected console.error during ErrorBoundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders normal children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Everything is working smoothly')).toBeInTheDocument();
  });

  it('catches render error and presents user-friendly Arabic recovery screen', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('حدث خطأ غير متوقع أثناء عرض هذه الصفحة')).toBeInTheDocument();
    expect(screen.getByText('إعادة تحميل الصفحة')).toBeInTheDocument();
    expect(screen.getByText('الصفحة الرئيسية')).toBeInTheDocument();
  });

  it('renders custom fallback when provided via props', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error Fallback</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
  });
});
