import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Settings,
    Volume2,
    Eye,
    Save,
    Moon,
    Sun,
    CloudRain,
    Music,
    LogOut,
    Camera
} from "lucide-react";
import { cn } from "../lib/utils";

export function SettingsView() {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [constellationMode, setConstellationMode] = useState(true);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_100%_100%,rgba(139,92,246,0.05)_0%,transparent_50%)]">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        PORTAL <span className="text-neon-cyan">SETTINGS</span>
                    </h1>
                    <p className="text-white/40 uppercase text-xs tracking-[0.2em] font-bold">System Configuration & User ID</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Captain's Log (Profile) */}
                    <section className="glass-panel p-8 space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Captain's Log</h2>
                        </div>

                        <div className="flex flex-col items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 relative group">
                            <div className="w-32 h-32 rounded-full bg-space-dark border-2 border-neon-cyan/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                                {/* Simulated Avatar (Helmet Icon as requested) */}
                                <div className="text-neon-cyan opacity-80 group-hover:scale-110 transition-transform duration-500">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20">
                                        <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z" />
                                        <path d="M7 10h10" />
                                        <path d="M8 6h8" />
                                        <circle cx="9" cy="14" r="1" />
                                        <circle cx="15" cy="14" r="1" />
                                        <path d="M12 18v.01" />
                                    </svg>
                                </div>
                                <button className="absolute inset-0 bg-space-dark/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <div className="space-y-4 w-full">
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5 block">Callsign</label>
                                    <input type="text" defaultValue="PRAJWAL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-neon-cyan/50 focus:outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5 block">Academy Sector</label>
                                    <input type="text" defaultValue="Quantum Engineering" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-neon-cyan/50 focus:outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Environmental Controls (Settings) */}
                    <section className="glass-panel p-8 space-y-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Environmental</h2>
                        </div>

                        <div className="space-y-6">
                            <ToggleRow
                                icon={<Music className="w-5 h-5" />}
                                label="Atmospheric Audio"
                                description="Lo-fi space ambient backgrounds"
                                enabled={audioEnabled}
                                onToggle={() => setAudioEnabled(!audioEnabled)}
                            />
                            <ToggleRow
                                icon={<Eye className="w-5 h-5" />}
                                label="Constellation Mode"
                                description="Show connections between planets"
                                enabled={constellationMode}
                                onToggle={() => setConstellationMode(!constellationMode)}
                            />
                            <div className="pt-4 flex flex-col gap-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Interface Theme</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                            theme === "dark" ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.15)]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                        )}
                                    >
                                        <Moon className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">DEEP SPACE</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                            theme === "light" ? "bg-white/10 border-white text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                        )}
                                    >
                                        <Sun className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">NEBULA</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-critical-red/10 border border-critical-red/20 text-critical-red hover:bg-critical-red hover:text-white transition-all font-bold uppercase text-xs tracking-widest">
                        <LogOut className="w-4 h-4" />
                        Eject Session
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-neon-cyan text-space-dark hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                        <Save className="w-4 h-4" />
                        Save Parameters
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToggleRow({ icon, label, description, enabled, onToggle }: {
    icon: React.ReactNode,
    label: string,
    description: string,
    enabled: boolean,
    onToggle: () => void
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="text-white/40">{icon}</div>
                <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{label}</h4>
                    <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    enabled ? "bg-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]" : "bg-white/10"
                )}
            >
                <motion.div
                    animate={{ x: enabled ? 26 : 4 }}
                    className={cn("w-4 h-4 rounded-full absolute top-1 transition-colors", enabled ? "bg-space-dark" : "bg-white/20")}
                />
            </button>
        </div>
    );
}
