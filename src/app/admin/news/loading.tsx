export default function AdminNewsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-white/10 rounded" />
          <div className="h-4 w-64 bg-white/5 rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-white/10 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-lg" />
        ))}
      </div>
      <div className="border border-white/10 rounded-lg">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-white/5 px-4 flex items-center">
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
