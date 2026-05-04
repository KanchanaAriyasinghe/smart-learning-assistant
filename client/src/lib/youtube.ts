// Uses youtube-transcript package — no API key needed, completely FREE
import { YoutubeTranscript } from 'youtube-transcript';

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export async function getTranscript(youtubeUrl: string): Promise<string> {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) throw new Error('Invalid YouTube URL. Please use a valid YouTube link.');

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error('No transcript available for this video.');
    }

    const fullText = transcriptItems
      .map(item => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '') // Remove [Music], [Applause] etc.
      .replace(/\s+/g, ' ')
      .trim();

    if (fullText.length < 100) {
      throw new Error('Transcript is too short to generate learning content.');
    }

    return fullText;
  } catch (error: any) {
    if (error.message.includes('Could not get transcripts')) {
      throw new Error(
        'This video does not have captions/subtitles enabled. Please try a video with captions.'
      );
    }
    throw error;
  }
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'max' = 'hq'): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    max: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}