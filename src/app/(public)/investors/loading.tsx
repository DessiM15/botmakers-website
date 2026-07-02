export default function InvestorsLoading() {
  return (
    <div className="pt-20 lg:pt-24 animate-pulse">
      <section className="bg-[#033457] py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="h-4 w-32 bg-white/10 rounded mb-4" />
          <div className="h-14 w-32 bg-white/10 rounded" />
          <div className="h-6 w-80 bg-white/5 rounded mt-4" />
        </div>
      </section>
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="h-64 bg-white rounded-xl border border-gray-200" />
        </div>
      </section>
      <section className="py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-48 bg-gray-50 rounded-xl" />
          <div className="h-48 bg-gray-50 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
