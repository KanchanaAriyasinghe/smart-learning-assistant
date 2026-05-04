import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN;

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const strapi = {
  // ── Subjects ──────────────────────────────────────────────
  getSubjects: (userId: string) =>
    client.get(`/subjects?filters[user_id][$eq]=${userId}&populate[topics][fields][0]=id&populate[topics][fields][1]=title&populate[topics][fields][2]=status&sort=createdAt:desc`),

  getSubject: (id: string) =>
    client.get(`/subjects/${id}?populate[topics][populate]=*`),

  createSubject: (data: Record<string, unknown>) =>
    client.post('/subjects', { data }),

  updateSubject: (id: string, data: Record<string, unknown>) =>
    client.put(`/subjects/${id}`, { data }),

  deleteSubject: (id: string) =>
    client.delete(`/subjects/${id}`),

  // ── Topics ────────────────────────────────────────────────
  getTopicsBySubject: (subjectId: string) =>
    client.get(`/topics?filters[subject][id][$eq]=${subjectId}&populate=subject&sort=createdAt:desc`),

  getTopic: (id: string) =>
    client.get(`/topics/${id}?populate[quiz_questions][fields][0]=id&populate[flashcards][fields][0]=id&populate[subject][fields][0]=name&populate[subject][fields][1]=color`),

  createTopic: (data: Record<string, unknown>) =>
    client.post('/topics', { data }),

  updateTopic: (id: string, data: Record<string, unknown>) =>
    client.put(`/topics/${id}`, { data }),

  deleteTopic: (id: string) =>
    client.delete(`/topics/${id}`),

  // ── Quiz Questions ────────────────────────────────────────
  getQuizQuestions: (topicId: string) =>
    client.get(`/quiz-questions?filters[topic][id][$eq]=${topicId}&pagination[limit]=50`),

  bulkCreateQuizQuestions: async (questions: Record<string, unknown>[], topicId: string) => {
    const results = [];
    for (const q of questions) {
      try {
        const res = await client.post('/quiz-questions', {
          data: { ...q, topic: topicId },
        });
        results.push(res.data);
      } catch (e) {
        console.error('Failed to save question:', e);
      }
    }
    return results;
  },

  // ── Flashcards ────────────────────────────────────────────
  getFlashcards: (topicId: string) =>
    client.get(`/flashcards?filters[topic][id][$eq]=${topicId}&pagination[limit]=50`),

  bulkCreateFlashcards: async (cards: Record<string, unknown>[], topicId: string) => {
    const results = [];
    for (const c of cards) {
      try {
        const res = await client.post('/flashcards', {
          data: { ...c, topic: topicId },
        });
        results.push(res.data);
      } catch (e) {
        console.error('Failed to save flashcard:', e);
      }
    }
    return results;
  },
};