import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/youtube';
import { generateLearningContent, checkOllamaStatus } from '@/lib/ollama';
import { strapi } from '@/lib/strapi';

export async function POST(req: NextRequest) {
  try {
    const { topicId, youtubeUrl, title } = await req.json();

    if (!topicId || !youtubeUrl || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check Ollama is running
    const ollamaStatus = await checkOllamaStatus();
    if (!ollamaStatus.running) {
      await strapi.updateTopic(topicId, {
        status: 'error',
        error_message: 'Ollama AI is not running. Run: ollama serve',
      });
      return NextResponse.json(
        { success: false, error: 'Ollama AI server is not running. Please start it with: ollama serve' },
        { status: 503 }
      );
    }

    // 1. Mark as processing
    await strapi.updateTopic(topicId, { status: 'processing' });

    // 2. Fetch YouTube transcript (FREE — no API key)
    console.log('Fetching transcript for:', youtubeUrl);
    const transcript = await getTranscript(youtubeUrl);
    console.log('Transcript length:', transcript.length, 'chars');

    // 3. Generate content with Ollama (FREE local AI)
    console.log('Generating content with Ollama model:', process.env.OLLAMA_MODEL);
    const content = await generateLearningContent(transcript, title);
    console.log('Generated:', {
      summaryLength: content.summary.length,
      concepts: content.keyConcepts.length,
      questions: content.quizQuestions.length,
      flashcards: content.flashcards.length,
    });

    // 4. Save to Strapi
    await strapi.updateTopic(topicId, {
      transcript: transcript.substring(0, 50000), // Store first 50k chars
      summary: content.summary,
      key_concepts: content.keyConcepts,
      status: 'ready',
      error_message: null,
    });

    // 5. Save quiz questions
    if (content.quizQuestions.length > 0) {
      await strapi.bulkCreateQuizQuestions(content.quizQuestions, topicId);
    }

    // 6. Save flashcards
    if (content.flashcards.length > 0) {
      await strapi.bulkCreateFlashcards(content.flashcards, topicId);
    }

    return NextResponse.json({
      success: true,
      message: 'Learning content generated successfully!',
      stats: {
        quizQuestions: content.quizQuestions.length,
        flashcards: content.flashcards.length,
        keyConcepts: content.keyConcepts.length,
      },
    });
  } catch (error: any) {
    console.error('Generation error:', error.message);

    // Update topic status to error
    try {
      const { topicId } = await req.json().catch(() => ({}));
      if (topicId) {
        await strapi.updateTopic(topicId, {
          status: 'error',
          error_message: error.message,
        });
      }
    } catch {}

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}