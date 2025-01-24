import SkeletonLoader from '../ui/SkeletonLoader.js';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <SkeletonLoader className="h-8 w-64" />
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg">
            <SkeletonLoader className="h-6 w-32 mb-2" />
            <SkeletonLoader className="h-10 w-20" />
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-gray-800 rounded-lg p-6">
        <SkeletonLoader className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <SkeletonLoader className="h-12 w-full" count={3} />
        </div>
      </div>
    </div>
  );
} 