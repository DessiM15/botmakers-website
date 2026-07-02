export default function ContactLoading() {
  return (
    <div className="pt-20 lg:pt-24 animate-pulse">
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="h-4 w-24 bg-white/10 rounded mb-4" />
          <div className="h-14 w-48 bg-white/10 rounded" />
          <div className="h-6 w-96 bg-white/5 rounded mt-4" />
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-100 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-40 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-[500px] bg-gray-50 rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
