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
- ElevenLabs API (Speech-to-Text, Translation, Text-to-Speech)
- FAL.ai API (Lip-sync)
- FFmpeg (Video processing)
- yt-dlp (Video downloading)

## Prerequisites

- Node.js 18+ and npm
- FFmpeg installed on your system
- API keys for ElevenLabs and FAL.ai

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd language-reel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key
FAL_API_KEY=your_fal_api_key
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
   - `ELEVENLABS_API_KEY`
   - `FAL_API_KEY`

5. Deploy the project

## Environment Variables

- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `FAL_API_KEY`: Your FAL.ai API key

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
