<div align="center">

<img src="https://img.shields.io/badge/MemHawk-AI%20Memory%20Forensics-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCA0IDgtNE0yIDEybDggNCA4LTQiLz48L3N2Zz4=" alt="MemHawk Banner"/>

# 🦅 MemHawk

### AI-Powered Memory Forensics Platform

*Automated LLM-driven forensic analysis of memory dumps — from raw scan output to structured PDF intelligence reports.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-Cross--Platform-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-Backend-3776AB?logo=python)](https://www.python.org/)
[![Volatility 3](https://img.shields.io/badge/Volatility_3-Forensics_Engine-red)](https://github.com/volatilityfoundation/volatility3)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-black?logo=ollama)](https://ollama.com/)

</div>

---

## 📌 What is MemHawk?

MemHawk bridges the gap between raw memory forensics and actionable intelligence. It wraps the power of **Volatility 3** in a modern Electron + React GUI, then pipes scan results through a **local LLM (Ollama 120B)** to automatically generate structured, human-readable PDF forensic reports — no cloud, no manual analysis.

> Designed for security analysts, DFIR professionals, and students who want to move fast without sacrificing depth.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **LLM Report Generation** | Converts raw Volatility scan output into executive summaries, security assessments, and risk-ranked findings using local Ollama models |
| 📄 **Automated PDF Reports** | Section-wise, structured PDF forensic reports generated end-to-end without manual formatting |
| 🔌 **Plugin Management** | Browse, select, and run Volatility 3 plugins from a clean UI — no CLI required |
| ⚡ **Real-time Progress** | Live scan tracking with per-plugin status updates |
| 🛡️ **Sandboxed Execution** | CPU/memory caps and timeouts per plugin run; STRIDE-based threat modeling baked in |
| 📊 **Confidence Scoring** | LLM-generated findings include confidence scores for analyst triage |
| 💾 **Results Export** | Save raw scan results as JSON alongside the generated PDF |
| 🪵 **Debug Logging** | Comprehensive internal logs for troubleshooting and audit trails |

---

## 🏗️ Architecture Overview

```
Memory Dump File
       │
       ▼
┌─────────────────────────────────────────────────┐
│              Electron + React UI                │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │ Plugin Panel │    │  Real-time Results   │   │
│  └──────┬───────┘    └──────────────────────┘   │
└─────────┼───────────────────────────────────────┘
          │
          ▼
┌─────────────────────────┐
│   Python Backend        │
│  Volatility 3 Runner    │  ◄── sandboxed execution
│  (CPU/mem caps, timeout)│
└────────────┬────────────┘
             │  Raw scan output
             ▼
┌─────────────────────────────────────┐
│       Prompt Engineering Layer      │
│  Process Lists · File System Data   │
│  Network Connections · Artifacts    │
│  → Structured context windows       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌────────────────────────────┐
│   Ollama LLM (120B local)  │
│  Executive Summary         │
│  Security Assessment       │
│  Risk-Ranked Findings      │
│  Confidence Scoring        │
└────────────────┬───────────┘
                 │
                 ▼
         PDF Forensic Report
```

---

## 🖥️ Tech Stack

**Frontend:** React, Tailwind CSS, Electron  
**Backend:** Python, Volatility 3, SQL  
**AI Layer:** Ollama LLM API (local, 120B), Prompt Engineering (RAG-style patterns)  
**Output:** Automated PDF generation, JSON export  
**Infrastructure:** Node.js, Bash (Linux), REST APIs  

---

## 📋 Requirements

- Node.js 16.x or later
- Python 3.6 or later
- [Volatility 3](https://github.com/volatilityfoundation/volatility3) framework installed and on `PATH`
- [Ollama](https://ollama.com/) running locally with a supported model (e.g. `ollama pull llama3`)
- Electron

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ShivamLahoty/memhawk.git
cd memhawk
```

### 2. Install dependencies

```bash
# Root dependencies (Electron + backend)
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Ensure Ollama is running

```bash
ollama serve
# In another terminal, pull a model if you haven't already:
ollama pull llama3
```

### 4. Run in development mode

```bash
npm start
```

This starts the React dev server and launches the Electron shell simultaneously.

---

## 🔨 Building for Distribution

```bash
npm run build
npm run electron-pack
```

Produces a packaged, distributable app for your platform.

---

## 📖 Usage Guide

1. **Launch MemHawk**
2. Click **"Select Image"** to load your memory dump file
3. Select the **Volatility plugins** you want to run from the plugin panel
4. Click **"Start Scan"** — watch real-time progress as plugins execute
5. When complete, review structured results in the UI
6. Click **"Generate Report"** to trigger the LLM pipeline and produce a PDF
7. Use **"Save"** to export raw JSON results
8. Click **"Logs"** to inspect debug output

---

## 🗂️ Supported Memory Image Formats

| Format | Extensions |
|---|---|
| Raw memory dumps | `.raw`, `.mem`, `.dmp` |
| VMware snapshots | `.vmem` |
| VirtualBox core dumps | *(standard VBox format)* |
| Physical memory images | `.img`, `.dd` |

---

## 🔍 How the LLM Pipeline Works

MemHawk uses a structured **prompt engineering system** analogous to RAG (Retrieval-Augmented Generation):

1. **Extraction** — Volatility plugins produce raw forensic artifacts (process lists, network connections, file system data, registry hives)
2. **Context Construction** — Artifacts are parsed and packed into structured context windows
3. **Prompt Dispatch** — Prompts are sent to the local Ollama model with instructions for each report section
4. **Report Assembly** — LLM outputs are stitched into a section-wise PDF including:
   - Executive Summary
   - Security Assessment
   - Risk-Ranked Findings with Confidence Scores
   - IOC Highlights

All inference runs **100% locally** — no data leaves your machine.

---

## 🛡️ Security Design

- **Sandboxed plugin execution** with per-run CPU and memory caps
- **Timeouts** prevent runaway plugin processes
- **STRIDE-based threat modeling** informs the LLM assessment prompts
- Local LLM inference ensures **air-gap compatibility** — suitable for sensitive investigations

---

## 🗺️ Roadmap

- [ ] Multi-image batch analysis
- [ ] Timeline reconstruction view
- [ ] Plugin comparison diffing
- [ ] YARA rule integration
- [ ] Custom LLM prompt templates
- [ ] Dark/light theme toggle

---

## 👤 Author

**Shivam Lahoty**  
B.Tech Computer & Communication Engineering — Manipal Institute of Technology  
Exchange Student — Montanuniversität Leoben, Austria  

[![GitHub](https://img.shields.io/badge/GitHub-ShivamLahoty-181717?logo=github)](https://github.com/ShivamLahoty)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Shivam%20Lahoty-0A66C2?logo=linkedin)](https://linkedin.com/in/shivam-lahoty)
[![Email](https://img.shields.io/badge/Email-shivaml0905%40gmail.com-EA4335?logo=gmail)](mailto:shivaml0905@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

*If MemHawk helped you, consider leaving a ⭐ — it helps others find the project.*

</div>