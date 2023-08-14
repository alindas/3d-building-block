import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/pages/error/500';
import AuthRouter from './AuthRouter';

export default function SecurityLayout(props: any) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthRouter>{props.children}</AuthRouter>
    </ErrorBoundary>
  );
}
