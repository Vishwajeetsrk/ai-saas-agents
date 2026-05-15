'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCreditsStore, useUserStore } from '@/lib/store';
import Link from 'next/link';
import { LogOut, Zap, BarChart3, Users, Settings } from 'lucide-react';

interface UserData {
  credits: number;
  usedCredits: number;
  plan: 'free' | 'pro';
  availableAgents: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCredits } = useCreditsStore();
  const { userId, plan, logout } = useUserStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/auth/login';
          return;
        }

        // Fetch credits
        const { data: credits } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Fetch subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        const planType = subscription ? 'pro' : 'free';
        const maxAgents = planType === 'pro' ? 7 : 2;

        setUserData({
          credits: credits?.credits || 100,
          usedCredits: credits?.used_credits || 0,
          plan: planType,
          availableAgents: maxAgents,
        });

        setCredits(credits?.credits || 100);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, setCredits, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Failed to load dashboard</div>
      </div>
    );
  }

  const availableCredits = userData.credits - userData.usedCredits;
  const usagePercent = (userData.usedCredits / userData.credits) * 100;

  return (
    <div className="min-h-screen bg-black text-white border-l-4 border-white">
      {/* Header */}
      <div className="border-b-4 border-white p-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-wider">AI SaaS</h1>
          <p className="text-gray-400 text-sm mt-1">{userData.plan.toUpperCase()} PLAN</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition border-2 border-white"
        >
          <LogOut size={20} />
          LOGOUT
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Credits Card */}
        <div className="border-4 border-white p-6 bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={28} className="text-yellow-400" />
            <h2 className="text-2xl font-black uppercase">Credits</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-5xl font-black">{availableCredits}</div>
              <p className="text-gray-400 text-sm">AVAILABLE</p>
            </div>
            <div className="w-full bg-gray-800 border-2 border-white h-4">
              <div
                className="bg-white h-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {userData.usedCredits} / {userData.credits} USED
            </p>
            {userData.plan === 'free' && (
              <Link
                href="/billing"
                className="block mt-4 px-4 py-2 bg-white text-black font-bold text-center hover:bg-gray-200 transition border-2 border-white uppercase text-sm"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="border-4 border-white p-6 bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={28} />
            <h2 className="text-2xl font-black uppercase">Usage</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">AGENTS AVAILABLE</p>
              <p className="text-3xl font-black">{userData.availableAgents}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">PLAN</p>
              <p className="text-2xl font-bold uppercase">{userData.plan}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-4 border-white p-6 bg-gray-900">
          <h2 className="text-2xl font-black uppercase mb-4">Actions</h2>
          <div className="space-y-3">
            <Link
              href="/agents"
              className="block px-4 py-3 bg-white text-black font-bold text-center hover:bg-gray-200 transition border-2 border-white uppercase"
            >
              Agent Playground
            </Link>
            <Link
              href="/billing"
              className="block px-4 py-3 bg-white text-black font-bold text-center hover:bg-gray-200 transition border-2 border-white uppercase"
            >
              Billing
            </Link>
            <Link
              href="/referrals"
              className="block px-4 py-3 bg-white text-black font-bold text-center hover:bg-gray-200 transition border-2 border-white uppercase flex items-center justify-center gap-2"
            >
              <Users size={18} />
              Referrals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
