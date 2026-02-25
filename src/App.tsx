import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { RightPanel } from "./components/RightPanel";
import { Observatory } from "./components/Observatory";
import { CalendarView } from "./components/CalendarView";
import { AnalyticsView } from "./components/AnalyticsView";
import { ResourcesView } from "./components/ResourcesView";
import { DependencyGraph } from "./components/DependencyGraph";
import { SettingsView } from "./components/SettingsView";
import { TaskListView } from "./components/TaskListView";

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  weight: number; // 1-3: Small, Medium, Massive
  status: 'pending' | 'overdue' | 'completed';
  subject: string;
  angle: number;
  parentId?: number;
}

// Initial Tasks
const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Physics Final Exam", subject: "Physics", dueDate: "2026-03-10", weight: 3, status: 'pending', angle: 45 },
  { id: 2, title: "Thermodynamics Quiz", subject: "Physics", dueDate: "2026-02-28", weight: 1, status: 'completed', angle: 120, parentId: 1 },
  { id: 3, title: "Quantum Lab", subject: "Physics", dueDate: "2026-03-02", weight: 2, status: 'pending', angle: 200, parentId: 1 },
  { id: 4, title: "CS Semester Project", subject: "CS", dueDate: "2026-03-15", weight: 3, status: 'pending', angle: 310 },
  { id: 5, title: "Database Schema", subject: "CS", dueDate: "2026-03-05", weight: 2, status: 'completed', angle: 15, parentId: 4 },
  { id: 6, title: "Auth Implementation", subject: "CS", dueDate: "2026-03-08", weight: 2, status: 'pending', angle: 80, parentId: 4 },
  { id: 7, title: "History Essay", subject: "History", dueDate: "2026-03-01", weight: 2, status: 'pending', angle: 150 },
  { id: 8, title: "Math Semester Test", subject: "Math", dueDate: "2026-03-12", weight: 3, status: 'pending', angle: 240 },
  { id: 9, title: "Calculus Review", subject: "Math", dueDate: "2026-03-05", weight: 1, status: 'pending', angle: 280, parentId: 8 },
];

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "calendar" | "analytics" | "resources" | "graph" | "settings">("dashboard");
  const [taskList, setTaskList] = useState(INITIAL_TASKS);

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <Observatory taskList={taskList} setTaskList={setTaskList} />;
      case "calendar": return <CalendarView taskList={taskList} setTaskList={setTaskList} />;
      case "tasks": return <TaskListView taskList={taskList} setTaskList={setTaskList} />;
      case "analytics": return <AnalyticsView taskList={taskList} />;
      case "resources": return <ResourcesView />;
      case "graph": return <DependencyGraph taskList={taskList} />;
      case "settings": return <SettingsView />;
      default: return <Observatory taskList={taskList} setTaskList={setTaskList} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-space-dark text-white overflow-hidden">
      <TopNav toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isExpanded={isSidebarExpanded}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <main className="flex-1 flex overflow-hidden relative">
          {renderView()}
          <RightPanel taskList={taskList} setTaskList={setTaskList} />
        </main>
      </div>
    </div>
  );
}
