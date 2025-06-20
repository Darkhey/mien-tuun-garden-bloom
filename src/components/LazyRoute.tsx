
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
    </div>
  )
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyRoute;
