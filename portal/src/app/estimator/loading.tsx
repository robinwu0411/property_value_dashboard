import Skeleton from "@/components/ui/Skeleton";

export default function EstimatorLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton width="200px" height="32px" />
      <Skeleton width="100%" height="20px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton width="100px" height="16px" />
            <Skeleton variant="rectangular" width="100%" height="42px" />
          </div>
        ))}
      </div>
      <Skeleton width="140px" height="40px" />
    </div>
  );
}
