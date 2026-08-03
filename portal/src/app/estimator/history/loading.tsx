import Skeleton from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      <Skeleton width="280px" height="32px" />
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="grid grid-cols-9 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} width="100%" height="14px" />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 border-b last:border-0">
            <div className="grid grid-cols-9 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                <Skeleton key={j} width="100%" height="14px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
