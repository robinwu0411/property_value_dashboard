import Skeleton from "@/components/ui/Skeleton";

export default function MarketLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton width="250px" height="32px" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-72 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton width="100px" height="16px" />
              <Skeleton variant="rectangular" width="100%" height="40px" />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height="80px" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" height="300px" />
            ))}
          </div>
          <Skeleton variant="rectangular" height="300px" />
          <Skeleton variant="rectangular" height="400px" />
        </div>
      </div>
    </div>
  );
}
