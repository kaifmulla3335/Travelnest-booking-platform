const PackageCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_14px_36px_rgba(11,23,40,0.08)] animate-pulse">
    <div className="aspect-[16/10] w-full bg-slate-200" />
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="mb-3 h-3 w-2/5 rounded-full bg-slate-200" />
      <div className="mb-2 h-5 w-4/5 rounded-full bg-slate-200" />
      <div className="mb-4 h-5 w-3/5 rounded-full bg-slate-200" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-xl bg-sky-50" />
        ))}
      </div>
      <div className="mt-3 h-8 rounded-lg bg-emerald-50" />
      <div className="mt-auto flex items-end justify-between border-t border-sky-100 pt-4">
        <div className="h-6 w-24 rounded-full bg-slate-200" />
        <div className="h-10 w-24 rounded-full bg-slate-200" />
      </div>
    </div>
  </div>
);

export default PackageCardSkeleton;
