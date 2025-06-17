# Language Reel Translator

A Next.js application that translates Instagram reels to different languages while maintaining lip-sync using AI technology.

## Features

- Upload Instagram reel URLs
- Translate to multiple languages
- AI-powered lip-sync
- Download processed videos
- Clean, modern UI with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (Whisper for transcription, GPT for translation)
- ElevenLabs API (Text-to-Speech)
- FAL.ai API (Lip-sync)
- RapidAPI (Instagram Reel Downloader)
- FFmpeg (Video processing)

## Prerequisites

- Node.js 18+ and npm
- FFmpeg installed on your system
- API keys for OpenAI, ElevenLabs, FAL.ai, and RapidAPI

## Setup

1. Clone the repository:
```bash
git clone https://github.com/RiptideStar/languages-reel.git
cd language-reel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
FAL_API_KEY=your_fal_api_key
RAPIDAPI_KEY=your_rapidapi_key
```

4. Create required directories:
```bash
mkdir -p public/output tmp
```

5. Start the development server:
```bash
npm run dev
```

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Go to [Vercel](https://vercel.com) and create a new project

3. Import your GitHub repository

4. Add the following environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `FAL_API_KEY`
   - `RAPIDAPI_KEY`

5. Deploy the project

## Environment Variables

- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key for transcription and translation
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key for text-to-speech
- `FAL_API_KEY`: Your FAL.ai API key for lip-sync
- `RAPIDAPI_KEY`: Your RapidAPI key for Instagram reel downloading

## Project Structure

```
language-reel/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── process/
│   │   │       └── route.ts
│   │   └── page.tsx
│   └── components/
│       ├── VideoForm.tsx
│       └── VideoPreview.tsx
├── public/
│   └── output/
├── tmp/
└── .env.local
```

