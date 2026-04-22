# ReelStudio 🎬

> **Free & Open Source AI-Powered Video Production Studio**

Transform your photos and videos into polished social media reels automatically. ReelStudio uses AI to analyze your media, select the best shots, and render professional videos with beat-synced transitions — all running locally on your machine.

## ✨ Features

- ⚡️ **Automated Ingestion** — Drop media into your library and they appear instantly in the app
- 🧠 **AI Analysis Engine** — Groq Vision (Llama 4 Scout) analyzes every shot for mood, quality, colors, and content
- 🎞️ **Smart Director** — AI generates narrative briefs matching the dominant mood and optimal aspect ratios
- 🎵 **Beat-Sync Technology** — Automatically snaps cuts to the BPM of your music tracks
- 🎬 **Remotion Renderer** — Renders sleek video templates (Ken Burns, Zooms, Split Reveals, Text Overlays) headlessly
- 📱 **Multi-Platform** — Export for TikTok (9:16), Instagram Feed (1:1), YouTube (16:9), and more

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **pnpm** (`npm install -g pnpm`)
- **FFmpeg** (`brew install ffmpeg` on macOS)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/ReelStudio.git
cd ReelStudio
pnpm install
```

### 2. Configure Environment

Create `apps/web/.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com)

### 3. Add Music (Optional)

```bash
mkdir -p apps/web/public/music
```

Drop royalty-free `.mp3` files named by mood: `cinematic.mp3`, `playful.mp3`, `emotional.mp3`, `epic.mp3`, `minimal.mp3`

### 4. Run the App

```bash
cd apps/web
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

1. **Upload** — Drag files into the app or drop them in your media folder
2. **Analyze** — AI grades each photo/video and extracts metadata
3. **Brief Builder** — Select a preset (TikTok, Instagram, etc.) and let AI pick the best shots with captions
4. **Render** — Remotion compiles the video frame-by-frame with transitions and effects
5. **Download** — Get your final MP4 ready to post

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript |
| Rendering | Remotion |
| AI | Groq API (Llama 4 Scout, Llama 3.3 70B) |
| Database | SQLite (better-sqlite3) |
| Video Processing | FFmpeg (fluent-ffmpeg) |
| Audio Analysis | music-tempo, node-web-audio-api |
| Package Manager | pnpm workspaces |

## 📂 Project Structure

```
ReelStudio-monorepo/
├── apps/
│   ├── web/           # Next.js web application
│   └── renderer/      # Remotion video rendering engine
├── packages/
│   └── types/         # Shared TypeScript types
└── ...
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License — see LICENSE file for details.

---

Built with ❤️ for creators who want to spend less time editing and more time creating.
