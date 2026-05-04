// Uses Ollama local AI — completely FREE, no API key needed
// Make sure Ollama is running: ollama serve

export interface GeneratedContent {
  summary: string;
  keyConcepts: string[];
  quizQuestions: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Flashcard {
  front: string;
  back: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        num_predict: 3000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama error: ${response.status}. Make sure Ollama is running (ollama serve) and model is pulled (ollama pull ${OLLAMA_MODEL})`
    );
  }

  const data = await response.json();
  return data.response;
}

function extractJSON(text: string): string {
  // Try to find JSON block in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  throw new Error('No valid JSON found in AI response');
}

export async function generateLearningContent(
  transcript: string,
  topicTitle: string
): Promise<GeneratedContent> {
  // Truncate transcript to avoid token limits
  const trimmedTranscript = transcript.substring(0, 5000);

  const prompt = `You are an educational content creator. Based on this transcript, create learning materials.

Topic: ${topicTitle}

Transcript:
${trimmedTranscript}

Respond ONLY with a valid JSON object. No extra text, no markdown, no explanation. Just the raw JSON:

{
  "summary": "Write a clear 2-3 paragraph summary of the main content here",
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
  "quizQuestions": [
    {
      "question": "Write question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Explain why this answer is correct",
      "difficulty": "medium"
    }
  ],
  "flashcards": [
    {
      "front": "Term or question",
      "back": "Definition or answer"
    }
  ]
}

Requirements:
- summary: 2-3 clear educational paragraphs
- keyConcepts: exactly 6 important terms/ideas
- quizQuestions: exactly 6 multiple choice questions, correct_answer is 0-3 (index)
- flashcards: exactly 8 cards covering key vocabulary
- difficulty values must be: "easy", "medium", or "hard"`;

  const rawResponse = await callOllama(prompt);
  
  try {
    const jsonStr = extractJSON(rawResponse);
    const parsed = JSON.parse(jsonStr) as GeneratedContent;
    
    // Validate and fix structure
    if (!parsed.summary) parsed.summary = 'Summary not available.';
    if (!parsed.keyConcepts || !Array.isArray(parsed.keyConcepts)) parsed.keyConcepts = [];
    if (!parsed.quizQuestions || !Array.isArray(parsed.quizQuestions)) parsed.quizQuestions = [];
    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) parsed.flashcards = [];
    
    return parsed;
  } catch (e) {
    throw new Error(
      'AI returned invalid JSON. Try a larger model: ollama pull llama3'
    );
  }
}

export async function checkOllamaStatus(): Promise<{ running: boolean; model: string; available: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await res.json();
    const models = data.models?.map((m: any) => m.name) || [];
    return {
      running: true,
      model: OLLAMA_MODEL,
      available: models,
    };
  } catch {
    return { running: false, model: OLLAMA_MODEL, available: [] };
  }
}