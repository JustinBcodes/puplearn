'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import CorgiMascot from './CorgiMascot';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
    } else {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
            <CorgiMascot size={100} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Don&apos;t worry, even the best pups have off days. Let&apos;s try again!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full bg-primary-500 dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-900 rounded text-xs overflow-auto max-h-40 text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

