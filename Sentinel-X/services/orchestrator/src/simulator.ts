import { AppDataSource } from "./data-source";
import { Process, ProcessStatus } from "./entities/Process";
import { Server } from "socket.io";
import axios from "axios";

export class Simulator {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public async start() {
    console.log("Simulator started...");
    setInterval(() => this.generateProcess(), 10000); // Every 10s
  }

  private async generateProcess() {
    const processRepository = AppDataSource.getRepository(Process);
    
    const names = ["Onboarding RH", "Conciliação Bancária", "Triagem de Suporte", "Aprovação de Crédito"];
    const name = names[Math.floor(Math.random() * names.length)];

    const process = new Process();
    process.name = name;
    process.status = ProcessStatus.PROCESSING;
    await processRepository.save(process);

    this.emitLog(`Iniciando processo: ${name} [${process.id.substring(0, 8)}]`);

    // Simulate work
    const shouldFail = Math.random() > 0.7; // 30% chance of bottleneck
    const duration = shouldFail ? 15000 : 2000; // Bottleneck takes 15s

    setTimeout(async () => {
      const p = await processRepository.findOneBy({ id: process.id });
      if (p) {
        if (shouldFail) {
          p.status = ProcessStatus.BOTTLENECK;
          p.durationMs = duration;
          await processRepository.save(p);
          this.emitLog(`⚠️ GARGALO DETECTADO: ${name} está travado!`, "warning");
          
          // Call AI Agent
          await this.triggerAIAgent(p);
        } else {
          p.status = ProcessStatus.COMPLETED;
          p.durationMs = duration;
          await processRepository.save(p);
          this.emitLog(`✅ Processo concluído: ${name}`, "success");
        }
        this.io.emit("process_update", p);
      }
    }, duration);
  }

  private emitLog(message: string, type: string = "info") {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    console.log(`[${log.timestamp}] ${message}`);
    this.io.emit("new_log", log);
  }

  private async triggerAIAgent(proc: Process) {
    this.emitLog(`🤖 Acionando Agente de IA para diagnóstico...`, "ai");
    try {
      const response = await axios.post(`${process.env.AI_AGENT_URL}/analyze`, {
        service_name: proc.name,
        error_log: "SLA_VIOLATION_TIMEOUT",
        latency_ms: proc.durationMs
      });

      const analysis = response.data.analysis;
      this.emitLog(`🧠 IA Diagnóstico: ${analysis}`, "ai");
      
      // Auto-fix simulation
      setTimeout(() => {
        this.emitLog(`🔧 Auto-Fix aplicado: Otimização de recursos concluída.`, "success");
        proc.status = ProcessStatus.COMPLETED;
        AppDataSource.getRepository(Process).save(proc);
        this.io.emit("process_update", proc);
      }, 3000);

    } catch (err: any) {
      this.emitLog(`❌ Falha ao contatar Agente de IA: ${err.message}`, "error");
    }
  }
}
