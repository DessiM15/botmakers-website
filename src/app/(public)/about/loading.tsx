export default function AboutLoading() {
  return (
    <div className="pt-20 lg:pt-24 animate-pulse">
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="h-4 w-24 bg-white/10 rounded mb-4" />
          <div className="h-14 w-96 bg-white/10 rounded" />
          <div className="h-6 w-full max-w-2xl bg-white/5 rounded mt-6" />
        </div>
      </section>
      <section className="py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded" />
            <div className="h-20 w-full bg-gray-50 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
