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

interface InstagramMedia {
  url: string;
  type: string;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels: {
    language: string;
    gender: string;
  };
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FAL_API_KEY = process.env.FAL_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Add debug logging for all API keys
console.log('API Keys Status:', {
  OPENAI_API_KEY: !!OPENAI_API_KEY,
  ELEVENLABS_API_KEY: !!ELEVENLABS_API_KEY,
  FAL_API_KEY: !!FAL_API_KEY,
  RAPIDAPI_KEY: !!RAPIDAPI_KEY
});

// Configure FAL.ai client
if (!FAL_API_KEY) {
  throw new Error('FAL_API_KEY is not configured in environment variables');
}
fal.config({
  credentials: FAL_API_KEY
});

async function downloadInstagramReel(url: string): Promise<Buffer> {
  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-reels-downloader-api.p.rapidapi.com/download',
      params: { url },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'instagram-reels-downloader-api.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    console.log('RapidAPI actual response:', response.data); // For debugging

    let videoUrl = null;
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.medias) &&
      response.data.data.medias.length > 0
    ) {
      // Find the first media item that has a valid url
      const videoMedia = response.data.data.medias.find(
        (media: InstagramMedia) => typeof media.url === 'string' && media.url.length > 0
      );
      if (videoMedia) {
        videoUrl = videoMedia.url;
      }
    }

    if (!videoUrl) {
      throw new Error('No video URL found in API response');
    }

    // Download the video
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    return Buffer.from(videoResponse.data);
  } catch (error) {
    console.error('Error downloading Instagram reel:', error);
    throw new Error('Failed to download Instagram reel: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const videoUrl = formData.get('videoUrl') as string;
    const targetLanguage = formData.get('targetLanguage') as string;

    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    if (!FAL_API_KEY) {
      throw new Error('FAL.ai API key is not configured');
    }

    if (!RAPIDAPI_KEY) {
      throw new Error('RapidAPI key is not configured');
    }

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key is not configured');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
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

    // Download video from Instagram
    console.log('Downloading video from Instagram...');
    const videoBuffer = await downloadInstagramReel(videoUrl);
    fs.writeFileSync(inputPath, videoBuffer);

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
    let suitableVoice = voices.find((voice: ElevenLabsVoice) => 
      voice.labels.language === targetLanguage.toLowerCase() &&
      voice.labels.gender === 'male' // Default to male voice
    );

    // If no matching voice found, try to find any voice in the target language
    if (!suitableVoice) {
      suitableVoice = voices.find((voice: ElevenLabsVoice) => 
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

    // Downscale to 480p and 24fps for faster FAL processing
    const downscaledPath = path.join(tempDir, `${sessionId}_input_480p_24fps.mp4`);
    console.log('Step: Downscaling video to 480p 24fps...');
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-vf', 'scale=-2:480', '-r', '24'])
        .on('end', () => resolve())
        .on('error', reject)
        .save(downscaledPath);
    });
    console.log('Step: Video downscaled to 480p 24fps.');

    // Use downscaledPath for FAL upload
    const videoData = fs.readFileSync(downscaledPath);
    const audioData = fs.readFileSync(translatedAudioPath);

    console.log('Step: Uploading to FAL...');
    const falVideoUrl = await fal.storage.upload(new Blob([videoData], { type: 'video/mp4' }));
    const falAudioUrl = await fal.storage.upload(new Blob([audioData], { type: 'audio/mpeg' }));

    console.log('Step: Submitting to FAL...');
    const result = await fal.subscribe("fal-ai/tavus/hummingbird-lipsync/v0", {
      input: {
        video_url: falVideoUrl,
        audio_url: falAudioUrl
      },
      logs: true,
      onQueueUpdate: (update: QueueStatus) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    console.log('Step: FAL processing complete.');

    // Download the result
    const response = await axios.get(result.data.video.url, {
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(finalPath, response.data);

    // Clean up temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(audioPath);
    fs.unlinkSync(downscaledPath);

    return NextResponse.json({
      success: true,
      outputUrl: `/output/${sessionId}_final.mp4`,
      message: 'Video processing completed successfully',
    });
  } catch (error: unknown) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process video' },
      { status: 500 }
    );
  }
} 