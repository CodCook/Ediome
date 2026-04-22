# Reel Studio 🎬
A local, AI-powered video production studio that automatically ingests photos/videos, uses Groq to analyze and sequence the best shots, and renders a polished animated social media video using Remotion.

## Features
- ⚡️ **Automated Ingestion**: Drop media into `~/ReelStudio/media` and they appear instantly in the app.
- 🧠 **AI Analysis Engine**: Groq Vision (meta-llama/llama-4-scout-17b-16e-instruct) analyzes every shot for mood, colors, description, and quality.
- 🎞️ **Smart Director**: Generates narrative briefs matching the dominant mood and optimal aspect ratios.
- 🎵 **Beat-Sync Technology**: Automatically drops cuts to the BPM of your audio tracks.
- 🎬 **Remotion Renderer**: Renders sleek video templates (Ken Burns, Zooms, Split reveals) headlessly in the background.

## Setup Instructions

### Prerequisites
1. **Node.js** v18+ 
2. **pnpm** installed globally (`npm install -g pnpm`)
3. **FFmpeg** installed globally on your machine (macOS: `brew install ffmpeg`)

### 1. Installation
Clone the repo and install dependencies:
```bash
pnpm install
```

### 2. Environment Variables
In the `apps/web/` directory, create a `.env.local` file:
```env
GROQ_API_KEY="your-groq-api-key"
```
*Note: Make sure your key has access to the Groq API.*

### 3. Adding Music (Optional, but recommended)
Create a `public/music/` folder inside `apps/web`:
```bash
mkdir -p apps/web/public/music
```
Drop royalty-free `.mp3` files into this directory named exactly by mood:
- `cinematic.mp3`
- `playful.mp3`
- `emotional.mp3`
- `epic.mp3`
- `minimal.mp3`

If Groq selects one of these moods for the brief and the file exists, Reel Studio will automatically beat-sync the video cuts to the tempo of the MP3 and render the audio with professional fade-ins.

### 4. Running the App
Start the Next.js development server:
```bash
cd apps/web
pnpm run dev
```
Open `http://localhost:3000` in your browser. 
The backend will automatically create a `~/ReelStudio` folder in your home directory to store SQLite databases, logs, and media.

## How it Works
1. **Upload**: Drag files into `~/ReelStudio/media` or upload via the web UI.
2. **Analyze**: Click "Analyze All". Groq grades each photo/video and extracts metadata and dimensions.
3. **Draft**: Go to the **Brief Builder**. Select a preset (e.g., TikTok, Instagram Feed). The AI will select the best shots and write captions.
4. **Render**: Go to **Render & Export**. Click Render. A child process natively spins up the Remotion engine in `apps/renderer` to compile the video frame-by-frame.
5. **Download**: Once the terminal finishes and the output is compressed via ffmpeg, download your final MP4 directly from the dashboard.
