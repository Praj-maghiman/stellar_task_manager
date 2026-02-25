import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Rocket, Sparkles } from "lucide-react";
import { Task } from "../App";

const SUBJECT_COLORS: Record<string, string> = {
    Physics: "#eab308",
    History: "#3b82f6",
    Math: "#ef4444",
    CS: "#8b5cf6",
    Literature: "#10b981",
    Art: "#ec4899",
    Biology: "#14b8a6",
    Other: "#a855f7"
};

export function CalendarView({
    taskList,
    setTaskList
}: {
    taskList: Task[];
    setTaskList: React.Dispatch<React.SetStateAction<Task[]>>
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formTask, setFormTask] = useState({
        title: "",
        subject: "Other",
        dueDate: new Date().toISOString().split('T')[0]
    });

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getTasksForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return taskList.filter(t => t.dueDate === dateStr);
    };

    const addTask = () => {
        if (!formTask.title.trim()) return;
        const newTask: Task = {
            id: Date.now(),
            title: formTask.title,
            subject: formTask.subject,
            dueDate: formTask.dueDate,
            weight: 1,
            status: 'pending',
            angle: Math.random() * 360,
        };
        setTaskList(prev => [...prev, newTask]);
        setIsModalOpen(false);
        setFormTask({ title: "", subject: "Other", dueDate: new Date().toISOString().split('T')[0] });
    };

    const deleteTask = (id: number) => {
        setTaskList(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-hidden bg-space-dark/50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-neon-cyan">{monthName}</span> {year}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/80 hover:bg-neon-cyan text-space-dark font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                    <Plus className="w-5 h-5" /> Launch Mission
                </button>
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-white/5 p-4 text-center text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                        {day}
                    </div>
                ))}
                <div className="contents">
                    {blankDays.map(i => <div key={`blank-${i}`} className="bg-space-dark/80 opacity-20" />)}
                    {days.map(day => {
                        const dayTasks = getTasksForDay(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <div key={day} className={`bg-space-dark/40 p-3 min-h-[120px] border-r border-b border-white/5 hover:bg-white/5 transition-colors group relative`}>
                                <span className={`text-sm font-bold ${isToday ? 'text-neon-cyan bg-neon-cyan/20 w-7 h-7 flex items-center justify-center rounded-full' : 'text-white/40'}`}>
                                    {day}
                                </span>
                                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                    {dayTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="text-[10px] p-1.5 rounded bg-white/5 border-l-2 flex items-center justify-between group/task hover:bg-white/10 transition-all"
                                            style={{ borderLeftColor: SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.Other }}
                                        >
                                            <span className="truncate text-white/80 font-medium">{task.title}</span>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="opacity-0 group-hover/task:opacity-100 p-0.5 hover:text-critical-red transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-dark/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass-panel p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/20"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                                    <Rocket className="w-6 h-6 text-neon-cyan" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Launch New Task</h2>
                                    <p className="text-xs text-white/50 uppercase tracking-widest">Orbital Deployment</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1">Task Identification</label>
                                    <input
                                        type="text"
                                        placeholder="Enter mission name..."
                                        value={formTask.title}
                                        onChange={e => setFormTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1">Sector</label>
                                    <select
                                        value={formTask.subject}
                                        onChange={e => setFormTask(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
                                    >
                                        {Object.keys(SUBJECT_COLORS).map(s => (
                                            <option key={s} value={s} className="bg-space-dark">{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={formTask.dueDate}
                                        onChange={e => setFormTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark]"
                                    />
                                </div>

                                <button onClick={addTask} className="w-full bg-neon-cyan text-space-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                                    <Sparkles className="w-5 h-5" /> LAUNCH TASK
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
