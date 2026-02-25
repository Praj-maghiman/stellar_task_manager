import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Folder,
    FileText,
    ChevronRight,
    Download,
    Plus,
    Search,
    BookOpen,
    Library
} from "lucide-react";

interface Resource {
    id: string;
    name: string;
    type: "pdf" | "doc" | "link";
    size?: string;
}

interface ResourceFolder {
    id: string;
    name: string;
    count: number;
    resources: Resource[];
    color: string;
}

const FOLDERS: ResourceFolder[] = [
    {
        id: "f1",
        name: "Physics",
        count: 12,
        color: "#eab308",
        resources: [
            { id: "r1", name: "Quantum Mechanics.pdf", type: "pdf", size: "2.4 MB" },
            { id: "r2", name: "Relativity Notes.doc", type: "doc" },
            { id: "r3", name: "Lab Experiment 4.pdf", type: "pdf", size: "1.1 MB" },
        ]
    },
    {
        id: "f2",
        name: "History",
        count: 8,
        color: "#3b82f6",
        resources: [
            { id: "r4", name: "Renaissance Art.pdf", type: "pdf", size: "4.5 MB" },
            { id: "r5", name: "Industrial Revolution.doc", type: "doc" },
        ]
    },
    {
        id: "f3",
        name: "Math",
        count: 15,
        color: "#ef4444",
        resources: [
            { id: "r6", name: "Calculus III.pdf", type: "pdf", size: "8.2 MB" },
            { id: "r7", name: "Linear Algebra.pdf", type: "pdf", size: "3.7 MB" },
        ]
    },
    {
        id: "f4",
        name: "Computer Science",
        count: 24,
        color: "#8b5cf6",
        resources: [
            { id: "r8", name: "Algorithm Design.pdf", type: "pdf", size: "12.1 MB" },
            { id: "r9", name: "Data Structures.doc", type: "doc" },
            { id: "r10", name: "React Patterns.pdf", type: "pdf", size: "2.8 MB" },
        ]
    },
];

export function ResourcesView() {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const folder = FOLDERS.find(f => f.id === selectedFolder);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.05)_0%,transparent_50%)]">
            {/* Header Overlay */}
            <div className="p-8 border-b border-white/5 bg-space-dark/40 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                            RESOURCE <span className="text-neon-cyan">NEBULA</span>
                        </h1>
                        <p className="text-white/40 uppercase text-xs tracking-[0.2em] font-bold">Knowledge Archive & File Core</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-neon-cyan transition-colors" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all w-64"
                            />
                        </div>
                        <button className="p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-space-dark transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Folders Side */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {FOLDERS.map((folder) => (
                            <motion.div
                                layoutId={folder.id}
                                key={folder.id}
                                onClick={() => setSelectedFolder(folder.id)}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`glass-panel p-6 cursor-pointer group transition-all relative overflow-hidden ${selectedFolder === folder.id ? 'border-neon-cyan/50 bg-neon-cyan/5 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : ''}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `radial-gradient(circle at center, ${folder.color}, transparent)` }} />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all shadow-inner">
                                        <Folder className="w-8 h-8" style={{ color: folder.color }} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-white">{folder.count}</span>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Documents</p>
                                    </div>
                                </div>

                                <div className="mt-6 relative z-10">
                                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-neon-cyan transition-colors">{folder.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (folder.count / 30) * 100)}%` }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: folder.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Resources Panel (Expandable) */}
                <AnimatePresence>
                    {selectedFolder && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className="w-[450px] border-l border-white/10 bg-space-dark/80 backdrop-blur-xl p-8 overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                                        <Library className="w-6 h-6 text-neon-cyan" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">{folder?.name}</h2>
                                        <p className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Knowledge Stream</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFolder(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {folder?.resources.map((res, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={res.id}
                                        className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-all group border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-neon-cyan/30 transition-all">
                                                <FileText className="w-5 h-5 text-white/40 group-hover:text-neon-cyan transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{res.name}</p>
                                                <p className="text-[10px] text-white/30 uppercase font-mono">{res.type} • {res.size || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-neon-cyan transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}

                                <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-neon-cyan/30 hover:bg-neon-cyan/5 transition-all group">
                                    <div className="p-2 rounded-lg bg-white/5 text-white/20 group-hover:text-neon-cyan transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 group-hover:text-neon-cyan transition-all tracking-widest">DRAG FILES HERE</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!selectedFolder && (
                <div className="absolute bottom-12 right-12 opacity-5 pointer-events-none">
                    <BookOpen className="w-64 h-64 text-white" />
                </div>
            )}
        </div>
    );
}
