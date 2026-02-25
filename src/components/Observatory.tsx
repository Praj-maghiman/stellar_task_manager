import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Rocket, Sparkles, Target, AlertCircle } from "lucide-react";
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

const WEIGHT_SIZES: Record<number, number> = {
  1: 14, // Small
  2: 24, // Medium
  3: 36, // Massive
};

const ORBIT_BASE_RADIUS = 60;
const ORBIT_SPACING = 45;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

export function Observatory({
  taskList,
  setTaskList
}: {
  taskList: Task[];
  setTaskList: React.Dispatch<React.SetStateAction<Task[]>>
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTask, setFormTask] = useState({
    title: "",
    subject: "Other",
    dueDate: new Date().toISOString().split('T')[0],
    weight: 2
  });

  const addTask = () => {
    if (!formTask.title.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: formTask.title,
      subject: formTask.subject,
      dueDate: formTask.dueDate,
      weight: formTask.weight,
      status: 'pending',
      angle: Math.random() * 360,
    };

    setTaskList(prev => [...prev, newTask]);
    setIsModalOpen(false);
    setFormTask({
      title: "",
      subject: "Other",
      dueDate: new Date().toISOString().split('T')[0],
      weight: 2
    });
  };

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Selected planet state
  const [selectedPlanetId, setSelectedPlanetId] = useState<number | null>(null);

  // Show hint tooltip
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Scroll to zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta * prev)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest(".planet-interactive")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Touch support
  const touchStart = useRef<{ x: number; y: number; panX: number; panY: number; dist?: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStart.current = { x: 0, y: 0, panX: pan.x, panY: pan.y, dist: Math.hypot(dx, dy) };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStart.current) return;
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      setPan({ x: touchStart.current.panX + dx, y: touchStart.current.panY + dy });
    } else if (e.touches.length === 2 && touchStart.current.dist != null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const scale = newDist / touchStart.current.dist;
      setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * scale)));
      touchStart.current.dist = newDist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate positions (in world-space, centered at 0,0)
  const sortedTasks = [...taskList].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const planets = sortedTasks.map(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    // Formula: R = (DaysUntilDeadline * 20) + 100
    // Clamping to 30 days as per user request
    const effectiveDays = Math.min(30, Math.max(0, diffDays));
    const radius = (effectiveDays * 20) + 100;

    const rad = (task.angle * Math.PI) / 180;
    const isOverdue = diffDays < 0;

    const size = WEIGHT_SIZES[task.weight] || 24;
    const color = SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.Other;

    return {
      ...task,
      name: task.title, // legacy name for some labels
      size,
      color,
      orbit: effectiveDays,
      overdue: isOverdue || task.status === 'overdue',
      radius: radius,
      wx: radius * Math.cos(rad),
      wy: radius * Math.sin(rad),
    };
  });

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId);

  // Transform: everything is inside a <g> that applies zoom+pan
  // Screen position of sun: cx + pan.x, cy + pan.y
  // All world coords are then scaled by zoom around the screen sun position.
  const transform = `translate(${cx + pan.x}, ${cy + pan.y}) scale(${zoom})`;

  // For HTML labels, convert world coords to screen coords
  const toScreen = (wx: number, wy: number) => ({
    sx: cx + pan.x + wx * zoom,
    sy: cy + pan.y + wy * zoom,
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-space-dark"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Star field */}
      <div className="absolute inset-0 star-field" />

      {/* Scrolling star parallax layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10px 10px, rgba(255,255,255,0.6), rgba(0,0,0,0)), " +
            "radial-gradient(1px 1px at 80px 50px, rgba(255,255,255,0.4), rgba(0,0,0,0)), " +
            "radial-gradient(1.5px 1.5px at 150px 30px, rgba(255,255,255,0.5), rgba(0,0,0,0)), " +
            "radial-gradient(1px 1px at 220px 90px, rgba(255,255,255,0.3), rgba(0,0,0,0))",
          backgroundSize: "300px 150px",
          backgroundRepeat: "repeat",
          transform: `translate(${pan.x * 0.3}px, ${pan.y * 0.3}px)`,
          opacity: 0.5,
        }}
      />

      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        style={{ userSelect: "none" }}
      >
        <defs>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {planets.map(p => (
            <radialGradient key={`grad-${p.id}`} id={`planet-grad-${p.id}`} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor={p.color} stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </radialGradient>
          ))}
        </defs>

        <g transform={transform}>
          {/* Orbit rings */}
          {/* Orbit rings: Today, 1d, 3d, 1w, 2w, 1mo (30d) */}
          {[
            { d: 0, label: "TODAY" },
            { d: 1, label: "1 DAY" },
            { d: 3, label: "3 DAYS" },
            { d: 7, label: "1 WEEK" },
            { d: 14, label: "2 WEEKS" },
            { d: 30, label: "1 MONTH" }
          ].map(marker => {
            const r = marker.d * 20 + 100;
            return (
              <g key={`orbit-${marker.d}`}>
                <circle
                  cx={0}
                  cy={0}
                  r={r}
                  fill="none"
                  stroke="var(--color-neon-cyan)"
                  strokeWidth={1 / zoom}
                  strokeOpacity="0.2"
                  strokeDasharray={`${6 / zoom} ${4 / zoom}`}
                />
                <text
                  x={r + 5 / zoom}
                  y={0}
                  fill="var(--color-neon-cyan)"
                  fontSize={8 / zoom}
                  fillOpacity="0.4"
                  fontWeight="bold"
                  dominantBaseline="middle"
                >
                  {marker.label}
                </text>
              </g>
            );
          })}

          {/* Collision lines removed to simplify */}

          {/* Sun */}
          <circle cx={0} cy={0} r={55} fill="url(#sun-glow)" />
          <circle cx={0} cy={0} r={25} fill="#FFD700" filter="url(#glow-strong)" />
          <text
            x={0} y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#0B0E14"
            fontSize={10 / zoom}
            fontWeight="bold"
            letterSpacing="1"
          >
            TODAY
          </text>

          {/* Planets */}
          {planets.map(planet => (
            <motion.g
              key={planet.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="planet-interactive"
              style={{ cursor: "pointer" }}
              onClick={e => {
                e.stopPropagation();
                setSelectedPlanetId(prev => prev === planet.id ? null : planet.id);
              }}
            >
              {/* Selection ring */}
              {selectedPlanet?.id === planet.id && (
                <circle
                  cx={planet.wx} cy={planet.wy}
                  r={planet.size / 2 + 6 / zoom}
                  fill="none"
                  stroke="white"
                  strokeWidth={1.5 / zoom}
                  strokeDasharray={`${3 / zoom} ${3 / zoom}`}
                  style={{ animation: "spin 4s linear infinite" }}
                />
              )}
              {/* Planet body */}
              <circle
                cx={planet.wx} cy={planet.wy}
                r={planet.size / 2}
                fill={`url(#planet-grad-${planet.id})`}
                filter="url(#glow)"
              />
              {/* Label line */}
              <line
                x1={planet.wx} y1={planet.wy}
                x2={planet.wx + planet.size / 2 + 8 / zoom}
                y2={planet.wy - planet.size / 2 - 8 / zoom}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1 / zoom}
              />
            </motion.g>
          ))}
        </g>
      </svg>

      {/* HTML labels — follow planets in screen space */}
      {planets.map(planet => {
        const { sx, sy } = toScreen(planet.wx, planet.wy);
        const labelX = sx + (planet.size / 2 + 10) * zoom / zoom + (planet.size / 2 + 10);
        const labelY = sy - (planet.size / 2 + 25);
        return (
          <motion.div
            key={`label-${planet.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute glass-panel px-2 py-1 text-[10px] font-medium whitespace-nowrap pointer-events-none select-none"
            style={{
              left: sx + (planet.size / 2 + 10),
              top: labelY,
              color: planet.overdue ? "var(--color-critical-red)" : "white",
              borderColor: planet.overdue ? "rgba(255,51,51,0.3)" : "rgba(255,255,255,0.1)",
              fontSize: Math.max(8, Math.min(12, 10 * zoom)),
              opacity: zoom < 0.4 ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {planet.name}
          </motion.div>
        );
      })}

      {/* Selected planet info card (Mission Report) */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            key={`mission-report-${selectedPlanet.id}`}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              left: toScreen(selectedPlanet.wx, selectedPlanet.wy).sx + 40,
              top: toScreen(selectedPlanet.wx, selectedPlanet.wy).sy - 100
            }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed glass-panel p-5 min-w-[280px] z-50 shadow-[0_0_40px_rgba(0,0,0,0.6)] border-white/20 select-none"
            style={{ pointerEvents: "auto" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, #ffffff88, ${selectedPlanet.color})`,
                    boxShadow: `0 0 15px ${selectedPlanet.color}44`
                  }}
                >
                  <Rocket className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{selectedPlanet.name}</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Mission Report</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanetId(null)}
                className="text-white/20 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-xs px-2 py-1.5 rounded bg-white/5">
                <span className="text-white/40">Status:</span>
                <span className={selectedPlanet.overdue ? "text-critical-red font-bold" : (selectedPlanet.status === 'completed' ? "text-green-400 font-bold" : "text-neon-cyan font-bold")}>
                  {selectedPlanet.status === 'completed' ? "✓ COMPLETED" : (selectedPlanet.overdue ? "⚠️ OVERDUE" : "ACTIVE")}
                </span>
              </div>
              <div className="flex justify-between text-xs px-2 py-1.5 rounded bg-white/5">
                <span className="text-white/40">Deadline:</span>
                <span className="text-white/80">{selectedPlanet.dueDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTaskList(prev => prev.map(t =>
                    t.id === selectedPlanet.id ? { ...t, status: 'completed' } : t
                  ));
                  setSelectedPlanetId(null);
                }}
                className="py-2 px-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                COMPLETE
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTaskList(prev => prev.filter(t => t.id !== selectedPlanet.id));
                  setSelectedPlanetId(null);
                }}
                className="py-2 px-3 rounded-lg bg-critical-red/20 border border-critical-red/30 text-critical-red text-xs font-bold hover:bg-critical-red/30 transition-all flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                ABORT
              </motion.button>
            </div>

            {/* Pointer notch */}
            <div
              className="absolute -left-2 top-24 w-4 h-4 glass-panel rotate-45 border-l border-b border-white/20"
              style={{ background: "inherit", borderTop: "none", borderRight: "none" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* Zoom in */}
        <button
          className="w-9 h-9 glass-panel flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all text-lg font-bold rounded-xl"
          onClick={() => setZoom(z => Math.min(MAX_ZOOM, z * 1.25))}
          title="Zoom In"
        >
          +
        </button>
        {/* Zoom out */}
        <button
          className="w-9 h-9 glass-panel flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all text-lg font-bold rounded-xl"
          onClick={() => setZoom(z => Math.max(MIN_ZOOM, z / 1.25))}
          title="Zoom Out"
        >
          −
        </button>
        {/* Reset */}
        <button
          className="w-9 h-9 glass-panel flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-xl text-base"
          onClick={resetView}
          title="Reset View"
        >
          ⌂
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 glass-panel px-3 py-1 text-[10px] text-white/40 rounded-lg z-10 font-mono">
        {Math.round(zoom * 100)}%
      </div>

      {/* Hint tooltip */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 text-xs text-white/60 text-center z-10 pointer-events-none"
          >
            🖱️ Drag to explore · Scroll to zoom · Click planets to inspect
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add Task FAB */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-6 left-6 w-14 h-14 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan/50 flex items-center justify-center text-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md z-30"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-space-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/20"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
              >
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1">Sector</label>
                    <select
                      value={formTask.subject}
                      onChange={e => setFormTask(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                    >
                      {Object.keys(SUBJECT_COLORS).map(s => (
                        <option key={s} value={s} className="bg-space-dark text-white">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1">Credit Weight</label>
                    <select
                      value={formTask.weight}
                      onChange={e => setFormTask(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value={1} className="bg-space-dark">Small (1x)</option>
                      <option value={2} className="bg-space-dark">Medium (2x)</option>
                      <option value={3} className="bg-space-dark">Massive (3x)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase mb-2 ml-1">Deadline</label>
                  <input
                    type="date"
                    value={formTask.dueDate}
                    onChange={e => setFormTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all cursor-pointer [color-scheme:dark]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addTask}
                  disabled={!formTask.title.trim()}
                  className="w-full bg-neon-cyan text-space-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  LAUNCH TASK
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
