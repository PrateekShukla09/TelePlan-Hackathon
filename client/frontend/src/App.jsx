import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Primitives';

const TelePlanApp = lazy(() => import('@/pages/TelePlanApp'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-40" />
      <Skeleton className="h-64" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<TelePlanApp />} />
        <Route path="/app/*" element={<TelePlanApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
