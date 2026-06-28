export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-secondary">Dashboard Overview</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-secondary">Admin User</span>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-md">
          A
        </div>
      </div>
    </header>
  );
}
