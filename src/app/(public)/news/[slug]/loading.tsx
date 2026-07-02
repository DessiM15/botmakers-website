export default function ArticleLoading() {
  return (
    <div className="pt-20 lg:pt-24 animate-pulse">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-8">
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-8 pb-8 space-y-4">
        <div className="h-3 w-40 bg-gray-100 rounded" />
        <div className="h-12 w-full bg-gray-100 rounded" />
        <div className="h-12 w-3/4 bg-gray-100 rounded" />
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 mb-12">
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-12 pb-20 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-50 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
