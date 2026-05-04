'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn('credentials', {
      email: form.email,
      name: form.name,
      callbackUrl: '/dashboard',
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Learning Assistant</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Turn YouTube videos into interactive study materials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? 'Signing in...' : 'Start Learning →'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
          💡 Powered by Ollama (free local AI) + Mistral 7B
        </div>
      </div>
    </div>
  );
}