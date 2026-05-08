"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Activity, AlertTriangle, Brain, CheckCircle, Cpu, Terminal as TerminalIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SOCKET_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:3001";

interface Log {
  timestamp: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "ai";
}

interface Process {
  id: string;
  name: string;
  status: string;
  durationMs: number;
}

export default function Home() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [efficiency, setEfficiency] = useState(98);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: "Conexão estabelecida com Sentinela-X", type: "success" }]);
    });

    socket.on("new_log", (log: Log) => {
      setLogs(prev => [...prev, log].slice(-100));
    });

    socket.on("process_update", (process: Process) => {
      setProcesses(prev => {
        const index = prev.findIndex(p => p.id === process.id);
        if (index > -1) {
          const newProcesses = [...prev];
          newProcesses[index] = process;
          return newProcesses;
        }
        return [process, ...prev].slice(0, 10);
      });
      
      if (process.status === "BOTTLENECK") {
        setEfficiency(prev => Math.max(prev - 5, 60));
      } else if (process.status === "COMPLETED") {
        setEfficiency(prev => Math.min(prev + 1, 99));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <main className="min-h-screen bg-background text-foreground p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-lg">
              <Cpu className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter">SENTINEL-X</h1>
              <p className="text-xs text-white/40 uppercase tracking-widest">Autonomous Orchestrator</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-white/40 uppercase">Eficiência do Sistema</div>
              <div className="text-2xl font-bold text-accent">{efficiency}%</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <div className="text-xs text-white/40 uppercase">Alertas Ativos</div>
              <div className="text-2xl font-bold text-red-500">
                {processes.filter(p => p.status === "BOTTLENECK").length}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Monitor */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-primary/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Activity size={120} />
              </div>
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2">
                <Activity size={16} className="text-accent" />
                MONITORAMENTO DE PROCESSOS
              </h2>
              
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {processes.length === 0 && (
                    <div className="text-white/20 text-center py-12 italic">Aguardando processos...</div>
                  )}
                  {processes.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        p.status === "BOTTLENECK" 
                          ? "bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          p.status === "COMPLETED" ? "text-green-500 bg-green-500/10" :
                          p.status === "BOTTLENECK" ? "text-red-500 bg-red-500/10 animate-pulse" :
                          "text-blue-500 bg-blue-500/10"
                        }`}>
                          {p.status === "COMPLETED" ? <CheckCircle size={20} /> : 
                           p.status === "BOTTLENECK" ? <AlertTriangle size={20} /> : 
                           <Activity size={20} />}
                        </div>
                        <div>
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-white/40">{p.id.substring(0, 8)} • {p.durationMs}ms</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {p.status}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Terminal / AI Log */}
          <div className="lg:col-span-1">
            <section className="bg-black border border-white/10 rounded-2xl flex flex-col h-[600px]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/60">
                  <TerminalIcon size={14} />
                  SENTINEL_DASHBOARD_V1.EXE
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[13px] terminal-scroll">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 leading-relaxed">
                    <span className="text-white/20 shrink-0">{log.timestamp}</span>
                    <span className={`
                      ${log.type === "warning" ? "text-yellow-500" : ""}
                      ${log.type === "error" ? "text-red-500" : ""}
                      ${log.type === "success" ? "text-green-500" : ""}
                      ${log.type === "ai" ? "text-accent font-bold" : "text-white/70"}
                    `}>
                      {log.type === "ai" && <Brain size={12} className="inline mr-2" />}
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
