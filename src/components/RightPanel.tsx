import { AlertTriangle, CheckCircle2, Trash2, Rocket } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../App";

const productivityData = [
  { name: "M", xp: 400 },
  { name: "T", xp: 300 },
  { name: "W", xp: 550 },
  { name: "T", xp: 200 },
  { name: "F", xp: 700 },
  { name: "S", xp: 100 },
  { name: "S", xp: 50 },
];

interface RightPanelProps {
  taskList: Task[];
  setTaskList: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function RightPanel({ taskList, setTaskList }: RightPanelProps) {
  const pendingTasks = taskList.filter(t => t.status !== 'completed');
  const overdueTasks = taskList.filter(t => t.status === 'overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'completed'));
  const completedTasks = taskList.filter(t => t.status === 'completed');

  const workloadCapacity = 10;
  const pressurePercentage = Math.min(100, Math.round((pendingTasks.length / workloadCapacity) * 100));

  const toggleComplete = (id: number) => {
    setTaskList(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    ));
  };

  const deleteTask = (id: number) => {
    setTaskList(prev => prev.filter(t => t.id !== id));
  };

  return (
    <aside className="w-80 h-[calc(100vh-4rem)] p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      {/* Workload Pressure Meter */}
      <div className="glass-panel p-5 flex flex-col items-center">
        <h3 className="text-xs font-bold tracking-widest text-white/70 mb-4 uppercase text-center">
          Workload Pressure Meter
        </h3>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={pressurePercentage > 80 ? "#FF3333" : (pressurePercentage > 50 ? "#EAB308" : "#00F0FF")}
              strokeWidth="12"
              strokeDasharray="351.8"
              initial={{ strokeDashoffset: 351.8 }}
              animate={{ strokeDashoffset: 351.8 - (351.8 * (pressurePercentage / 100)) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={pressurePercentage > 80 ? "glow-red" : (pressurePercentage > 50 ? "glow-yellow" : "glow-cyan")}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-white">{pressurePercentage}%</span>
            <span className={`text-[10px] uppercase font-semibold mt-1 ${pressurePercentage > 80 ? 'text-critical-red' : (pressurePercentage > 50 ? 'text-yellow-400' : 'text-neon-cyan')}`}>
              {pressurePercentage > 80 ? 'High Load' : (pressurePercentage > 50 ? 'Moderate' : 'Optimal')}
            </span>
          </div>
        </div>
        {overdueTasks.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-critical-red bg-critical-red/10 px-3 py-1.5 rounded-full border border-critical-red/20 shadow-[0_0_10px_rgba(255,51,51,0.2)]">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">{overdueTasks.length} Missions Overdue</span>
          </div>
        )}
      </div>

      {/* Overdue Projects */}
      <div className="glass-panel p-5 shadow-[0_0_15px_rgba(255,51,51,0.15)] border-critical-red/20">
        <h3 className="text-xs font-bold tracking-widest text-critical-red mb-4 uppercase flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Overdue Missions
        </h3>
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {overdueTasks.map(task => (
              <motion.li
                layout
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between gap-2 p-3 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{task.title}</p>
                  <p className="text-[10px] text-critical-red/70 font-mono tracking-tighter capitalize">{task.dueDate}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => toggleComplete(task.id)} className="p-1.5 rounded hover:bg-green-500/20 text-white/30 hover:text-green-400 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded hover:bg-red-500/20 text-white/30 hover:text-critical-red transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {overdueTasks.length === 0 && <p className="text-[10px] text-white/30 text-center italic py-2">No overdue missions</p>}
        </ul>
      </div>

      {/* Active Missions */}
      <div className="glass-panel p-5 border-white/10">
        <h3 className="text-xs font-bold tracking-widest text-white/50 mb-4 uppercase flex items-center gap-2">
          <Rocket className="w-4 h-4" /> Active Missions
        </h3>
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {pendingTasks.filter(t => !overdueTasks.find(ot => ot.id === t.id)).map(task => (
              <motion.li
                layout
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between gap-2 p-3 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/80 truncate">{task.title}</p>
                  <p className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">{task.subject}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => toggleComplete(task.id)} className="p-1.5 rounded hover:bg-green-500/20 text-white/30 hover:text-green-400 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {pendingTasks.filter(t => !overdueTasks.find(ot => ot.id === t.id)).length === 0 && (
            <p className="text-[10px] text-white/30 text-center italic py-2">No active missions</p>
          )}
        </ul>
      </div>

      {/* Completed Submissions */}
      <div className="glass-panel p-5 shadow-[0_0_15px_rgba(34,197,94,0.15)] border-green-500/20">
        <h3 className="text-xs font-bold tracking-widest text-green-400 mb-4 uppercase flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Completed
        </h3>
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {completedTasks.map(task => (
              <motion.li
                layout
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between gap-2 p-3 rounded bg-green-500/5 border border-green-500/10 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/60 line-through truncate">{task.title}</p>
                </div>
                <div className="flex items-center gap-1 opacity-100 group-hover:opacity-100 transition-all">
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded hover:bg-red-500/20 text-white/30 hover:text-critical-red transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {completedTasks.length === 0 && <p className="text-[10px] text-white/30 text-center italic py-2">Missions pending completion</p>}
        </ul>
      </div>

      {/* Productivity Points (Static for now as per design) */}
      <div className="glass-panel p-5">
        <h3 className="text-xs font-bold tracking-widest text-white/70 mb-4 uppercase">
          Mission Activity
        </h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="xp" fill="#00F0FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </aside>
  );
}
