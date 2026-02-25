import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Trash2,
    CheckCircle2,
    Circle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ArrowUpDown,
    ListFilter
} from "lucide-react";
import { Task } from "../App";
import { cn } from "../lib/utils";

interface TaskListViewProps {
    taskList: Task[];
    setTaskList: React.Dispatch<React.SetStateAction<Task[]>>;
}

type SortKey = "dueDate" | "weight" | "title" | "subject";

export function TaskListView({ taskList, setTaskList }: TaskListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("dueDate");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "overdue" | "completed">("all");
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

    const toggleComplete = (id: number) => {
        setTaskList(prev => prev.map(t =>
            t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
        ));
    };

    const deleteTask = (id: number) => {
        setTaskList(prev => prev.filter(t => t.id !== id));
    };

    const filteredAndSortedTasks = useMemo(() => {
        return taskList
            .filter(t => {
                const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.subject.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = filterStatus === "all" || t.status === filterStatus;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortKey === "weight") return b.weight - a.weight;
                if (sortKey === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                return a[sortKey].toString().localeCompare(b[sortKey].toString());
            });
    }, [taskList, searchQuery, sortKey, filterStatus]);

    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};
        filteredAndSortedTasks.forEach(task => {
            if (!groups[task.subject]) groups[task.subject] = [];
            groups[task.subject].push(task);
        });
        return groups;
    }, [filteredAndSortedTasks]);

    const toggleSubject = (subject: string) => {
        setExpandedSubjects(prev => {
            const next = new Set(prev);
            if (next.has(subject)) next.delete(subject);
            else next.add(subject);
            return next;
        });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,240,255,0.03)_0%,transparent_50%)]">
            {/* Search and Filters Header */}
            <div className="p-8 border-b border-white/5 bg-space-dark/40 backdrop-blur-md">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                                MISSION <span className="text-neon-cyan">LOG</span>
                            </h1>
                            <p className="text-white/40 uppercase text-xs tracking-[0.2em] font-bold">Deep Space Task Coordination</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-neon-cyan transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Filter by title or subject..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all w-72"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <ListFilter className="w-4 h-4 text-white/40" />
                            <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                                {["all", "pending", "overdue", "completed"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                            filterStatus === status
                                                ? "bg-neon-cyan text-space-dark shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                                                : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-white/40" />
                            <select
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as SortKey)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                            >
                                <option value="dueDate" className="bg-space-dark text-white">Sort by Date</option>
                                <option value="weight" className="bg-space-dark text-white">Sort by Weight</option>
                                <option value="title" className="bg-space-dark text-white">Sort by Name</option>
                                <option value="subject" className="bg-space-dark text-white">Sort by Subject</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Groups */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-6">
                    {Object.entries(groupedTasks).map(([subject, tasks]) => (
                        <div key={subject} className="space-y-4">
                            <button
                                onClick={() => toggleSubject(subject)}
                                className="flex items-center gap-3 group w-full text-left"
                            >
                                <div className={cn(
                                    "p-1 rounded-md bg-white/5 border border-white/10 text-white/40 group-hover:text-neon-cyan transition-all transform",
                                    expandedSubjects.has(subject) ? "rotate-180" : ""
                                )}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">{subject}</h2>
                                <div className="h-px flex-1 bg-white/5 group-hover:bg-neon-cyan/20 transition-all" />
                                <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">{tasks.length} Missions</span>
                            </button>

                            <AnimatePresence initial={false}>
                                {!expandedSubjects.has(subject) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-3"
                                    >
                                        {tasks.map((task) => (
                                            <TaskRow
                                                key={task.id}
                                                task={task}
                                                onToggle={() => toggleComplete(task.id)}
                                                onDelete={() => deleteTask(task.id)}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {filteredAndSortedTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <ListFilter className="w-16 h-16 mb-4" />
                            <p className="text-xl font-bold uppercase tracking-widest">No matching missions found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TaskRow({ task, onToggle, onDelete }: { task: Task, onToggle: () => void, onDelete: () => void }) {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const isCompleted = task.status === 'completed';

    const WEIGHT_LABELS: Record<number, string> = {
        1: "Small",
        2: "Medium",
        3: "Massive"
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "glass-panel p-4 flex items-center gap-6 group hover:bg-white/5 transition-all border-white/5",
                isOverdue && "border-critical-red/20 bg-critical-red/5",
                isCompleted && "opacity-60"
            )}
        >
            {/* Priority Indicator */}
            <div className="flex flex-col items-center gap-1 w-10">
                <div className={cn(
                    "h-1.5 w-full rounded-full",
                    task.weight === 3 ? "bg-neon-cyan glow-cyan" :
                        task.weight === 2 ? "bg-white/40" : "bg-white/10"
                )} />
                <span className="text-[8px] font-black uppercase text-white/20">{WEIGHT_LABELS[task.weight]}</span>
            </div>

            {/* Completion Button */}
            <button
                onClick={onToggle}
                className={cn(
                    "p-2 rounded-xl transition-all",
                    isCompleted ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-white/20 hover:text-white"
                )}
            >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>

            {/* Task Info */}
            <div className="flex-1 min-w-0">
                <h3 className={cn(
                    "text-sm font-bold tracking-tight truncate",
                    isCompleted ? "line-through text-white/30" : "text-white/90"
                )}>
                    {task.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5">
                        <Clock className={cn("w-3 h-3", isOverdue ? "text-critical-red" : "text-white/20")} />
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isOverdue ? "text-critical-red" : "text-white/40"
                        )}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    {isOverdue && (
                        <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-critical-red" />
                            <span className="text-[10px] font-black text-critical-red uppercase tracking-widest">CRITICAL DELAY</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onDelete}
                    className="p-2.5 rounded-xl bg-white/5 text-white/30 hover:bg-critical-red/20 hover:text-critical-red transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
