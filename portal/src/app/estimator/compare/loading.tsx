import Skeleton from "@/components/ui/Skeleton";

export default function CompareLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton width="200px" height="32px" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height="80px" />
        ))}
      </div>
    </div>
  );
}
