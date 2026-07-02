export default function PartnersLoading() {
  return (
    <div className="pt-20 lg:pt-24">
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded mb-4" />
          <div className="h-14 w-64 bg-white/10 rounded" />
          <div className="h-6 w-96 bg-white/5 rounded mt-4" />
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-16 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
              ))}
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gray-100" />
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-gray-100 rounded" />
                  <div className="h-3 w-56 bg-gray-50 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
