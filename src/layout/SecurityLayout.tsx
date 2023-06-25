import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/pages/error/500';

export default function SecurityLayout(props: any) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {props.children}
    </ErrorBoundary>
  );
}
