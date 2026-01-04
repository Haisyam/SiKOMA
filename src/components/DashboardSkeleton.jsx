export default function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card animate-pulse space-y-4">
          <div className="h-10 w-10 rounded-2xl bg-white/10" />
          <div className="h-3 w-1/2 rounded-full bg-white/10" />
          <div className="h-5 w-2/3 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}
