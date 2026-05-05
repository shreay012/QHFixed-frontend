'use client';

import React from 'react';

/**
 * React Error Boundary — catches render/lifecycle errors in child tree.
 * Wrap any component that can crash (ChatPanel, PaymentStep, etc.)
 *
 * Usage:
 *   <ErrorBoundary>
 *     <ChatPanel ... />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
    // TODO: send to Sentry when integrated
    // Sentry.captureException(error, { extra: info });
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) return fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5" />
              <path d="M12 7v5M12 16v.5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); }}
            className="px-5 py-2 bg-[#45A735] text-white text-sm font-semibold rounded-lg hover:bg-[#3d9230] transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
