export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
        <p className="text-sm text-gray-400">Loading admin panel...</p>
      </div>
    </div>
  );
}
