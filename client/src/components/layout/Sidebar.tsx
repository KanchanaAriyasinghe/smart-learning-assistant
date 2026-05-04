'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/subjects', icon: '📚', label: 'Subjects' },
  { href: '/topics/new', icon: '➕', label: 'Add Video' },
  { href: '/progress', icon: '📊', label: 'My Progress' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-indigo-600">🧠 SmartLearn</h1>
        <p className="text-xs text-gray-400 mt-0.5">AI-Powered Learning</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}