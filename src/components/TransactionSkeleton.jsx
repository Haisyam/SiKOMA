export default function TransactionSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-full bg-white/10" />
              <div className="h-3 w-20 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="h-4 w-24 rounded-full bg-white/10" />
          <div className="flex gap-2">
            <div className="h-9 flex-1 rounded-xl bg-white/10" />
            <div className="h-9 w-12 rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
