import { Menu, Rocket } from "lucide-react";

export function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="h-16 border-b border-white/10 glass-panel rounded-none flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-lg font-semibold tracking-widest text-white/90">
          STELLAR ACADEMIC PORTAL
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
          <Rocket className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">Log In</span>
        </div>
      </div>
    </header>
  );
}
