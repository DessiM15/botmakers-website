export default function NewsLoading() {
  return (
    <div className="pt-20 lg:pt-24">
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 animate-pulse">
          <div className="h-4 w-24 bg-white/10 rounded mb-4" />
          <div className="h-14 w-80 bg-white/10 rounded" />
          <div className="h-6 w-96 bg-white/5 rounded mt-4" />
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="h-52 bg-gray-100" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-5 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-3/4 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
