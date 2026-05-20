export function ListCardSkeleton() {
  return (
    <li className="flex animate-pulse items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-3 w-56 rounded bg-slate-200" />
        <div className="h-3 w-32 rounded bg-slate-200" />
      </div>
      <div className="h-9 w-16 rounded-lg bg-slate-200" />
    </li>
  );
}
