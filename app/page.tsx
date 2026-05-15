'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Zap, Code, Cpu, GitBranch, BarChart3, Users } from 'lucide-react';

export default function HomePage() {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    };
    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white border-l-4 border-white">
      {/* Header */}
      <header className="border-b-4 border-white p-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-wider">AI SaaS</h1>
          <p className="text-gray-400 text-sm">Autonomous AI Agents Platform</p>
        </div>
        <div className="flex gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 transition border-2 border-white"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-gray-700 transition border-2 border-gray-700"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-6 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 transition border-2 border-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b-4 border-white p-12 md:p-24">
        <div className="max-w-4xl">
          <h2 className="text-6xl md:text-7xl font-black uppercase leading-tight mb-6">
            AI Agents That Code
          </h2>
          <p className="text-2xl text-gray-300 mb-8">
            Seven autonomous AI agents to analyze projects, suggest improvements, generate UI,
            build APIs, debug code, optimize databases, and create documentation.
          </p>
          {!isAuthenticated && (
            <Link
              href="/auth/sign-up"
              className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-xl hover:bg-gray-200 transition border-4 border-white"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Agents Grid */}
      <section className="border-b-4 border-white p-12 md:p-24">
        <h2 className="text-5xl font-black uppercase mb-12">Seven Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Cpu, title: 'Analyzer', desc: '25 credits' },
            { icon: GitBranch, title: 'Suggester', desc: '30 credits' },
            { icon: Code, title: 'UI Generator', desc: '50 credits' },
            { icon: Zap, title: 'API Generator', desc: '50 credits' },
            { icon: BarChart3, title: 'Debugger', desc: '40 credits' },
            { icon: Users, title: 'DB Optimizer', desc: '45 credits' },
          ].map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div key={idx} className="border-4 border-white p-6 bg-gray-900 hover:bg-white hover:text-black transition">
                <Icon size={40} className="mb-4" />
                <h3 className="text-2xl font-black uppercase mb-2">{agent.title}</h3>
                <p className="text-gray-400 hover:text-black">{agent.desc}</p>
              </div>
            );
          })}
          <div className="border-4 border-white p-6 bg-gray-900">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-black uppercase mb-2">Documentation</h3>
            <p className="text-gray-400">35 credits</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-b-4 border-white p-12 md:p-24">
        <h2 className="text-5xl font-black uppercase mb-12">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-4 border-gray-600 p-8 bg-gray-950">
            <h3 className="text-3xl font-black uppercase mb-4">Free</h3>
            <p className="text-5xl font-black mb-6">$0</p>
            <ul className="space-y-3 mb-8">
              <li className="font-bold">✓ 100 credits/month</li>
              <li className="font-bold">✓ 2 agents access</li>
              <li className="font-bold">✓ Community support</li>
            </ul>
            {!isAuthenticated && (
              <Link
                href="/auth/sign-up"
                className="block px-6 py-3 bg-gray-700 text-white font-bold uppercase text-center hover:bg-gray-600 transition border-2 border-gray-600"
              >
                Get Started
              </Link>
            )}
          </div>
          <div className="border-4 border-white p-8 bg-gray-900">
            <h3 className="text-3xl font-black uppercase mb-4">Pro</h3>
            <p className="text-5xl font-black mb-6">$29<span className="text-2xl text-gray-400">/mo</span></p>
            <ul className="space-y-3 mb-8">
              <li className="font-bold">✓ 1,000 credits/month</li>
              <li className="font-bold">✓ All 7 agents</li>
              <li className="font-bold">✓ Priority support</li>
              <li className="font-bold">✓ API access</li>
            </ul>
            {!isAuthenticated && (
              <Link
                href="/auth/sign-up"
                className="block px-6 py-3 bg-white text-black font-bold uppercase text-center hover:bg-gray-200 transition border-2 border-white"
              >
                Try Pro
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Growth Systems */}
      <section className="border-b-4 border-white p-12 md:p-24">
        <h2 className="text-5xl font-black uppercase mb-12">Grow With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-4 border-white p-8 bg-gray-900">
            <h3 className="text-2xl font-black uppercase mb-4">Referral Program</h3>
            <p className="text-gray-400 mb-6">Share your code and earn 50 credits for each friend who signs up.</p>
            <p className="font-bold text-lg">No limits on earning</p>
          </div>
          <div className="border-4 border-white p-8 bg-gray-900">
            <h3 className="text-2xl font-black uppercase mb-4">Affiliate Program</h3>
            <p className="text-gray-400 mb-6">Earn 20% commission on subscriptions, 15% on credit packages.</p>
            <p className="font-bold text-lg">Monthly payouts</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b-4 border-white p-12 md:p-24 bg-gray-900 text-center">
        <h2 className="text-5xl font-black uppercase mb-6">Ready to Get Started?</h2>
        <p className="text-2xl text-gray-400 mb-8">100 free credits included</p>
        {!isAuthenticated && (
          <Link
            href="/auth/sign-up"
            className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-xl hover:bg-gray-200 transition border-4 border-white"
          >
            Create Free Account
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-white p-8 text-gray-400 text-sm text-center">
        <p>© 2025 AI SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
