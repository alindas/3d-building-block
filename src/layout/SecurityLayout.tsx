import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthRouter from './AuthRouter';
import InternalError from '@/pages/error/500';

export default function SecurityLayout(props: any) {
  return (
    <ErrorBoundary FallbackComponent={InternalError}>
      <AuthRouter>{props.children}</AuthRouter>
    </ErrorBoundary>
  );
}
