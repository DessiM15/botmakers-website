export default function EditArticleLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-white/10 rounded" />
        <div className="h-4 w-64 bg-white/5 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 bg-white/5 rounded" />
          <div className="h-10 bg-white/5 rounded" />
          <div className="h-64 bg-white/5 rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-10 bg-white/5 rounded" />
          <div className="h-40 bg-white/5 rounded" />
          <div className="h-10 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}
