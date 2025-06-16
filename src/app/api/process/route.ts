import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';
import { fal } from "@fal-ai/client";

interface QueueStatus {
  status: string;
  logs?: Array<{ message: string }>;
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FAL_API_KEY = process.env.FAL_API_KEY;

// Configure FAL.ai client
fal.config({
  credentials: FAL_API_KEY
});

// Add debug logging
console.log('FAL API Key available:', !!FAL_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const targetLanguage = formData.get('targetLanguage') as string;

    if (!videoFile) {
      throw new Error('No video file provided');
    }

    if (!FAL_API_KEY) {
      throw new Error('FAL.ai API key is not configured');
    }

    // Create directories
    const tempDir = path.join(process.cwd(), 'tmp');
    const outputDir = path.join(process.cwd(), 'public', 'output');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const sessionId = uuidv4();
    const inputPath = path.join(tempDir, `${sessionId}_input.mp4`);
    const audioPath = path.join(tempDir, `${sessionId}_audio.mp3`);
    const translatedAudioPath = path.join(outputDir, `${sessionId}_translated.mp3`);
    const finalPath = path.join(outputDir, `${sessionId}_final.mp4`);

    // Save uploaded file
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(inputPath, buffer);

    // Extract audio from video
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', () => resolve())
        .on('error', reject)
        .save(audioPath);
    });

    // 1. Transcribe audio using OpenAI Whisper
    console.log('Transcribing audio...');
    const audioFormData = new FormData();
    audioFormData.append('file', fs.createReadStream(audioPath), {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });
    audioFormData.append('model', 'whisper-1');
    audioFormData.append('language', 'en');

    const transcriptionResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      audioFormData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          ...audioFormData.getHeaders(),
        },
      }
    );

    const transcription = transcriptionResponse.data.text;
    console.log('Transcription:', transcription);

    // 2. Translate text using OpenAI
    console.log('Translating text...');
    const translationResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text to ${targetLanguage}. Keep the same tone and style.`
          },
          {
            role: 'user',
            content: transcription
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translatedText = translationResponse.data.choices[0].message.content;
    console.log('Translation:', translatedText);

    // 3. Convert to speech using ElevenLabs
    console.log('Converting to speech...');
    const voicesResponse = await axios.get(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    const voices = voicesResponse.data.voices;
    
    // First try to find a voice matching both language and gender
    let suitableVoice = voices.find((voice: any) => 
      voice.labels.language === targetLanguage.toLowerCase() &&
      voice.labels.gender === 'male' // Default to male voice
    );

    // If no matching voice found, try to find any voice in the target language
    if (!suitableVoice) {
      suitableVoice = voices.find((voice: any) => 
        voice.labels.language === targetLanguage.toLowerCase()
      );
    }

    // If still no matching voice, use the first available voice
    if (!suitableVoice) {
      suitableVoice = voices[0];
    }

    console.log('Selected voice:', suitableVoice.name);

    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${suitableVoice.voice_id}`,
      {
        text: translatedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    fs.writeFileSync(translatedAudioPath, ttsResponse.data);

    // 4. Apply lip-sync using FAL.ai
    console.log('Applying lip-sync...');
    try {
      // Upload files to FAL.ai storage
      const videoFile = new File([fs.readFileSync(inputPath)], 'input.mp4', { type: 'video/mp4' });
      const audioFile = new File([fs.readFileSync(translatedAudioPath)], 'audio.mp3', { type: 'audio/mpeg' });

      const videoUrl = await fal.storage.upload(videoFile);
      const audioUrl = await fal.storage.upload(audioFile);

      // Submit lip-sync request
      const result = await fal.subscribe("fal-ai/tavus/hummingbird-lipsync/v0", {
        input: {
          video_url: videoUrl,
          audio_url: audioUrl
        },
        logs: true,
        onQueueUpdate: (update: QueueStatus) => {
          if (update.status === "IN_PROGRESS" && update.logs) {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      // Download the result
      const response = await axios.get(result.data.video.url, {
        responseType: 'arraybuffer'
      });
      fs.writeFileSync(finalPath, response.data);

      // Clean up temporary files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(audioPath);

      return NextResponse.json({
        success: true,
        outputUrl: `/output/${sessionId}_final.mp4`,
        message: 'Video processing completed successfully',
      });
    } catch (error: unknown) {
      console.error('FAL.ai Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process lip-sync');
    }
  } catch (error: unknown) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process video' },
      { status: 500 }
    );
  }
} 