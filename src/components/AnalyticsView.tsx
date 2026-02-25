import { motion } from "framer-motion";
import {
    TrendingUp,
    Target,
    Zap,
    ChevronRight,
    Activity,
    Award
} from "lucide-react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import { Task } from "../App";

interface AnalyticsViewProps {
    taskList: Task[];
}

const productivityData = [
    { name: "Mon", pts: 450 },
    { name: "Tue", pts: 320 },
    { name: "Wed", pts: 600 },
    { name: "Thu", pts: 250 },
    { name: "Fri", pts: 800 },
    { name: "Sat", pts: 150 },
    { name: "Sun", pts: 100 },
];

export function AnalyticsView({ taskList }: AnalyticsViewProps) {
    // Logic for metrics
    const completedTasks = taskList.filter(t => t.status === 'completed');
    const onTimeTasks = completedTasks.filter(t => true); // Placeholder for on-time logic

    const velocity = (completedTasks.length / 4).toFixed(1); // Placeholder per week
    const accuracy = taskList.length > 0 ? Math.round((completedTasks.length / taskList.length) * 100) : 0;
    const gritScore = completedTasks.reduce((acc, t) => acc + (t.weight * 10), 0);

    // Radar Data Mapping
    const subjectWeights: Record<string, number> = {};
    taskList.forEach(t => {
        subjectWeights[t.subject] = (subjectWeights[t.subject] || 0) + (t.status === 'completed' ? t.weight : 0.2);
    });

    const radarData = Object.keys(subjectWeights).map(subject => ({
        subject,
        A: subjectWeights[subject],
        fullMark: 10,
    })).slice(0, 6);

    if (radarData.length < 3) {
        // Fill with defaults if data is sparse
        ['Physics', 'Math', 'History'].forEach(s => {
            if (!radarData.find(d => d.subject === s)) {
                radarData.push({ subject: s, A: 0.5, fullMark: 10 });
            }
        });
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05)_0%,transparent_50%)]">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        ANALYTICS <span className="text-neon-cyan">NEBULA</span>
                    </h1>
                    <p className="text-white/40 uppercase text-xs tracking-[0.2em] font-bold">Performance & Trajectory Analysis</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Constellation Radar Chart */}
                    <section className="lg:col-span-2 glass-panel p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-32 h-32 text-neon-cyan" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Subject Mastery</h2>
                        <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">Orbital Knowledge Depth</p>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' }} />
                                    <Radar
                                        name="Mastery"
                                        dataKey="A"
                                        stroke="#00F0FF"
                                        fill="#00F0FF"
                                        fillOpacity={0.3}
                                        dot={{ fill: '#00F0FF', r: 4 }}
                                        animationDuration={1500}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Progress Metrics Side Cards */}
                    <div className="flex flex-col gap-4">
                        <MetricCard
                            icon={<Zap className="w-5 h-5 text-yellow-400" />}
                            label="VELOCITY"
                            value={`${velocity}/wk`}
                            sub="Avg Completion Rate"
                            gradient="from-yellow-400/20 to-transparent"
                        />
                        <MetricCard
                            icon={<Target className="w-5 h-5 text-neon-cyan" />}
                            label="ACCURACY"
                            value={`${accuracy}%`}
                            sub="On-Time Deployment"
                            gradient="from-neon-cyan/20 to-transparent"
                        />
                        <MetricCard
                            icon={<Award className="w-5 h-5 text-purple-400" />}
                            label="GRIT SCORE"
                            value={gritScore.toString()}
                            sub="Resistance & Load XP"
                            gradient="from-purple-400/20 to-transparent"
                        />
                    </div>
                </div>

                {/* Productivity Peaks */}
                <section className="glass-panel p-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Productivity Peaks</h2>
                            <p className="text-xs text-white/40 uppercase tracking-widest">Daily XP Accumulation</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-neon-cyan antialias glow-cyan" />
                                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Active Week</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productivityData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0B0E14',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                />
                                <Bar
                                    dataKey="pts"
                                    fill="#00F0FF"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={2000}
                                >
                                    {productivityData.map((entry, index) => (
                                        <motion.rect key={`bar-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, sub, gradient }: {
    icon: React.ReactNode,
    label: string,
    value: string,
    sub: string,
    gradient: string
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`glass-panel p-6 flex items-center gap-5 transition-all bg-gradient-to-br ${gradient}`}
        >
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                {icon}
            </div>
            <div>
                <h4 className="text-[10px] font-black text-white/40 tracking-[0.2em] mb-1">{label}</h4>
                <div className="text-2xl font-black text-white leading-tight mb-1">{value}</div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{sub}</p>
            </div>
            <div className="ml-auto opacity-20">
                <ChevronRight className="w-5 h-5 text-white" />
            </div>
        </motion.div>
    );
}
