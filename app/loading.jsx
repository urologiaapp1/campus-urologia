export default function Loading() {
  return (
    <div className="space-y-6 py-4 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="h-4 w-96 rounded-lg bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-36 bg-slate-50 p-5">
            <div className="h-3 w-16 rounded bg-slate-200 mb-3" />
            <div className="h-5 w-48 rounded bg-slate-200 mb-4" />
            <div className="h-2 w-full rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
