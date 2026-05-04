'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { strapi } from '@/lib/strapi';
import type { Subject } from '@/types';

interface Props {
  subjects: Subject[];
  userId: string;
}

export default function VideoUploadForm({ subjects, userId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', youtubeUrl: '', subjectId: '' });
  const [step, setStep] = useState<'form' | 'generating' | 'done' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('generating');
    setLoadingMsg('Creating topic in database...');

    try {
      // 1. Create topic in Strapi
      const { data: topicData } = await strapi.createTopic({
        title: form.title,
        youtube_url: form.youtubeUrl,
        subject: parseInt(form.subjectId),
        status: 'pending',
        user_id: userId,
        publishedAt: new Date().toISOString(),
      });

      const topicId = topicData.data.id;
      setLoadingMsg('Fetching YouTube transcript... (may take 10-20 seconds)');

      // 2. Trigger AI generation
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          youtubeUrl: form.youtubeUrl,
          title: form.title,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      setStep('done');
      router.push(`/topics/${topicId}`);
    } catch (error: any) {
      setStep('error');
      setErrorMsg(error.message);
    }
  };

  if (step === 'generating') {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-5" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generating Learning Content
        </h3>
        <p className="text-gray-500 text-sm">{loadingMsg}</p>
        <div className="mt-4 p-3 bg-indigo-50 rounded-xl text-xs text-indigo-600">
          ⏱ This takes 30–90 seconds depending on your computer
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="text-center py-10 max-w-md mx-auto">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="font-semibold text-gray-900 mb-2">Generation Failed</h3>
        <p className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-xl">{errorMsg}</p>
        <div className="text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-xl mb-4">
          <p className="font-medium mb-2">Troubleshooting:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ensure Ollama is running: <code className="bg-gray-200 px-1 rounded">ollama serve</code></li>
            <li>Check model is pulled: <code className="bg-gray-200 px-1 rounded">ollama pull mistral</code></li>
            <li>Make sure video has captions/subtitles</li>
            <li>Try a different YouTube video</li>
          </ul>
        </div>
        <button
          onClick={() => setStep('form')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Topic Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g. Introduction to Photosynthesis"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          YouTube URL *
        </label>
        <input
          type="url"
          value={form.youtubeUrl}
          onChange={e => setForm({ ...form, youtubeUrl: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="https://youtube.com/watch?v=..."
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          ⚠️ Video must have captions/subtitles enabled
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Subject *
        </label>
        <select
          value={form.subjectId}
          onChange={e => setForm({ ...form, subjectId: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          required
        >
          <option value="">Select a subject...</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.attributes.icon} {s.attributes.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
        <p className="font-medium mb-1">✓ Using free local AI (Ollama)</p>
        <p className="text-xs text-blue-600">No API costs. Runs on your machine.</p>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        🚀 Generate Learning Content
      </button>
    </form>
  );
}