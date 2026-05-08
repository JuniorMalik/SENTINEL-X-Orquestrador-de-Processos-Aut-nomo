# SENTINEL-X 🛰️ | Autonomous Process Orchestrator

**Sentinel-X** é um protótipo de orquestração de processos de missão crítica, desenvolvido para demonstrar a aplicação prática de **Agentes de IA** na identificação e correção de gargalos operacionais.

O **Sentinel-X** foca em remover a "gestão no escuro", trazendo visibilidade total via telemetria em tempo real e automação inteligente.

## 🚀 Arquitetura

O sistema é composto por 3 microserviços principais orquestrados via Docker:

1.  **Orchestrator (Node.js/TS)**: O cérebro do sistema. Gerencia o ciclo de vida dos processos, monitora SLAs e emite eventos via WebSockets/Redis.
2.  **AI-Agent (Python/Gemini)**: O especialista. Utiliza IA Generativa (Google Gemini) para analisar logs de erro e sugerir planos de correção (Auto-Fix).
3.  **Command Center (Next.js/React)**: A torre de controle. Dashboard de alta performance com estética de terminal, focado em observabilidade e KPIs de eficiência.

## 🛠️ Tecnologias Utilizadas

-   **Backend**: Node.js, TypeScript, Express, TypeORM.
-   **Inteligência Artificial**: Python, FastAPI, Google Gemini 2.5 Flash.
-   **Mensageria & Cache**: Redis.
-   **Banco de Dados**: PostgreSQL.
-   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Socket.io.
-   **Infraestrutura**: Docker, Docker Compose.

## 🧠 O Diferencial: IA Agêntica

Diferente de automações baseadas em regras rígidas (If/Else), o **Sentinel-X** utiliza um agente de IA que:
-   Analisa o contexto do gargalo.
-   Interpreta logs não estruturados.
-   Gera diagnósticos baseados em melhores práticas de SRE.
-   Aplica correções simuladas para restaurar a eficiência do sistema.

## 📦 Como Executar

1.  Clone o repositório.
2.  Certifique-se de ter o Docker instalado.
3.  Configure sua `GEMINI_API_KEY` no arquivo `.env`.
4.  Execute o comando:
    ```bash
    docker-compose up --build
    ```
5.  Acesse o Dashboard em: `http://localhost:3000`

---
*Desenvolvido Por wilson borges.*
