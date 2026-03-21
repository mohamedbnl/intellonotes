export default function AdminPaymentsLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-7 w-72 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-200 rounded mt-2" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 animate-pulse"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-gray-200 rounded-lg" />
              <div className="h-8 flex-1 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
