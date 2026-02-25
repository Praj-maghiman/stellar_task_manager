import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Network,
    Share2,
    Maximize2,
    Info,
    Maximize,
    MousePointer2
} from "lucide-react";
import { Task } from "../App";

interface DependencyGraphProps {
    taskList: Task[];
}

interface Node {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    title: string;
    isParent: boolean;
    status: string;
    color: string;
    subject: string;
}

const SUBJECT_COLORS: Record<string, string> = {
    Physics: "#eab308",
    History: "#3b82f6",
    Math: "#ef4444",
    CS: "#8b5cf6",
    Other: "#a855f7"
};

export function DependencyGraph({ taskList }: DependencyGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [draggingNode, setDraggingNode] = useState<number | null>(null);
    const [highlightedParentId, setHighlightedParentId] = useState<number | null>(null);
    const requestRef = useRef<number | undefined>(undefined);

    // Initialize nodes with Hierarchical or Subject logic
    useEffect(() => {
        const width = window.innerWidth - 300;
        const height = window.innerHeight - 150;
        const hasManualDependencies = taskList.some(t => !!t.parentId);

        const newNodes: Node[] = taskList.map((task) => {
            const isParent = task.weight === 3;
            let x, y;

            if (hasManualDependencies) {
                // Hierarchical Placement
                x = 150 + Math.random() * (width - 300);
                y = isParent ? height * 0.15 : height * (0.5 + Math.random() * 0.35);
            } else {
                // Subject Clustering
                const subjects = Array.from(new Set(taskList.map(t => t.subject)));
                const sIndex = subjects.indexOf(task.subject);
                const angle = (sIndex / subjects.length) * Math.PI * 2;
                const centerX = width / 2;
                const centerY = height / 2;
                const scatter = 100;

                x = centerX + Math.cos(angle) * 200 + (Math.random() - 0.5) * scatter;
                y = centerY + Math.sin(angle) * 200 + (Math.random() - 0.5) * scatter;
            }

            return {
                id: task.id,
                x,
                y,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                radius: isParent ? 30 : 18,
                title: task.title,
                isParent,
                status: task.status,
                color: SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.Other,
                subject: task.subject
            };
        });
        setNodes(newNodes);
    }, [taskList]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Physics update
        nodes.forEach((node) => {
            if (draggingNode === node.id) return;
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < node.radius || node.x > canvas.width - node.radius) node.vx *= -1;
            if (node.y < node.radius || node.y > canvas.height - node.radius) node.vy *= -1;
            node.vx *= 0.999;
            node.vy *= 0.999;
        });

        // Draw Threads
        taskList.forEach(task => {
            if (task.parentId) {
                const from = nodes.find(n => n.id === task.parentId);
                const to = nodes.find(n => n.id === task.id);
                if (from && to) {
                    const isHighlighted = highlightedParentId === from.id;
                    const isCompleted = to.status === 'completed';

                    ctx.beginPath();
                    ctx.lineWidth = isHighlighted ? 3 : 1;

                    let opacity = isCompleted ? 0.1 : 0.4;
                    if (isHighlighted) opacity = 1.0;

                    const strokeStyle = isHighlighted ? "#00F0FF" : to.color;
                    ctx.strokeStyle = `${strokeStyle}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;

                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.stroke();

                    if (isHighlighted || !isCompleted) {
                        ctx.shadowBlur = isHighlighted ? 15 : 5;
                        ctx.shadowColor = strokeStyle;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }
        });

        // Draw Nodes
        nodes.forEach(node => {
            const isComplete = node.status === 'completed';
            const isHighlightedChild = highlightedParentId && taskList.find(t => t.id === node.id && t.parentId === highlightedParentId);
            const isSelectedParent = highlightedParentId === node.id;

            let strokeColor = isComplete ? "#10b981" : node.color;
            if (isSelectedParent || isHighlightedChild) strokeColor = "#00F0FF";

            ctx.shadowBlur = (isComplete || isSelectedParent) ? 25 : 15;
            ctx.shadowColor = strokeColor;

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = isComplete ? "#10b98122" : "#0B0E14";
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = (isSelectedParent || isHighlightedChild) ? 4 : 2;
            ctx.stroke();

            ctx.shadowBlur = 0;

            // Labels
            ctx.fillStyle = "white";
            ctx.font = `bold ${node.isParent ? '12px' : '10px'} Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.globalAlpha = (highlightedParentId && !isSelectedParent && !isHighlightedChild) ? 0.3 : 1;
            ctx.fillText(node.title.toUpperCase(), node.x, node.y + node.radius + 15);
            ctx.globalAlpha = 1;

            if (node.isParent) {
                ctx.font = 'black 8px Inter';
                ctx.fillStyle = isSelectedParent ? "#00F0FF" : "rgba(255,255,255,0.4)";
                ctx.fillText("PARENT MODULE", node.x, node.y - node.radius - 8);
            }
        });

        requestRef.current = requestAnimationFrame(draw);
    }, [nodes, draggingNode, taskList, highlightedParentId]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(draw);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [draw]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let clickedNodeId: number | null = null;
        nodes.forEach(node => {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            if (dist < node.radius * 2) {
                clickedNodeId = node.id;
                setDraggingNode(node.id);
            }
        });

        // Selection Logic
        if (clickedNodeId) {
            const task = taskList.find(t => t.id === clickedNodeId);
            if (task?.weight === 3) {
                setHighlightedParentId(clickedNodeId === highlightedParentId ? null : clickedNodeId);
            }
        } else {
            setHighlightedParentId(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingNode === null) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x, y } : n));
    };

    const handleMouseUp = () => setDraggingNode(null);

    return (
        <div className="flex-1 flex flex-col h-full bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.05)_0%,transparent_50%)] relative overflow-hidden">
            <div className="absolute top-8 left-8 z-10 space-y-2 pointer-events-none">
                <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                    DEPENDENCY <span className="text-neon-cyan">GRAPH</span>
                </h1>
                <p className="text-white/40 uppercase text-xs tracking-[0.2em] font-bold">Hierarchical Mission Mapping</p>
            </div>

            <div className="absolute top-8 right-8 z-10 flex gap-4 items-center">
                <div className="flex items-center gap-2 glass-panel px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <MousePointer2 className="w-3 h-3 text-neon-cyan" />
                    Click Parent to Map Links
                </div>
                <button className="glass-panel p-3 text-white/50 hover:text-neon-cyan transition-all">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={window.innerWidth - 300}
                height={window.innerHeight - 100}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="flex-1 cursor-grab active:cursor-grabbing"
            />

            <div className="absolute bottom-8 left-8 glass-panel p-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neon-cyan glow-cyan" />
                    <span className="text-[10px] font-black text-white/60 tracking-widest">SELECTED MODULE</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] opacity-50" />
                    <span className="text-[10px] font-black text-white/60 tracking-widest">CLEARED PATH</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-white/10" />
                    <span className="text-[10px] font-black text-white/60 tracking-widest">INACTIVE THREAD</span>
                </div>
            </div>
        </div>
    );
}
