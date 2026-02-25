import {
  Star,
  Calendar,
  ListTodo,
  BarChart2,
  Folder,
  Network,
  Settings
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { id: "dashboard", icon: Star, label: "Dashboard" },
  { id: "calendar", icon: Calendar, label: "Calendar View" },
  { id: "tasks", icon: ListTodo, label: "Task List" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "resources", icon: Folder, label: "Resource Nebula" },
  { id: "graph", icon: Network, label: "Task Dependency Graph" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  isExpanded: boolean;
  currentView: string;
  onViewChange: (view: any) => void;
}

export function Sidebar({ isExpanded, currentView, onViewChange }: SidebarProps) {
  return (
    <aside
      className={cn(
        "glass-panel rounded-none border-t-0 border-l-0 border-b-0 h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col py-4",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-white/10",
              currentView === item.id && "bg-white/10 text-neon-cyan",
              !isExpanded && "justify-center"
            )}
            title={!isExpanded ? item.label : undefined}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", currentView === item.id ? "text-neon-cyan" : "text-white/70")} />
            {isExpanded && (
              <span className={cn("text-sm font-medium whitespace-nowrap", currentView === item.id ? "text-neon-cyan" : "text-white/70")}>
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
