'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ChevronLeft, Copy, Check } from 'lucide-react';

interface Referral {
  id: string;
  referral_code: string;
  status: string;
  referred_user_id: string | null;
  created_at: string;
}

export default function ReferralsPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>('');
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Fetch user's referrals
        const { data } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false });

        setReferrals(data || []);

        // Check if user has a referral code (from being referred)
        const { data: refData } = await supabase
          .from('referrals')
          .select('referral_code')
          .eq('referred_user_id', user.id)
          .limit(1)
          .single();

        if (!refData) {
          generateReferralCode(user.id);
        }
      }
    };

    fetchData();
  }, [supabase]);

  const generateReferralCode = async (uid: string) => {
    setIsLoading(true);
    try {
      // In production, this would call an API endpoint
      // For now, we'll create a simple local code
      const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setReferralCode(code);

      // Store in referrals table
      await supabase.from('referrals').insert({
        referrer_id: uid,
        referral_code: code,
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redeemedCount = referrals.filter((r) => r.status === 'redeemed').length;
  const bonusCredits = redeemedCount * 50;

  return (
    <div className="min-h-screen bg-black text-white border-l-4 border-white">
      {/* Header */}
      <div className="border-b-4 border-white p-6 flex items-center gap-4">
        <Link href="/dashboard" className="hover:opacity-70 transition">
          <ChevronLeft size={32} />
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-wider">Referral Program</h1>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Your Referral Code */}
        <div className="border-4 border-white p-8 bg-gray-900">
          <h2 className="text-2xl font-black uppercase mb-6">Your Referral Code</h2>
          <p className="text-gray-400 mb-4">Share your code and earn 50 credits for each friend who signs up!</p>
          
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-black border-2 border-white p-4 font-mono text-xl font-bold">
              {referralCode || 'Loading...'}
            </div>
            <button
              onClick={copyToClipboard}
              className="px-6 py-4 bg-white text-black font-bold uppercase hover:bg-gray-200 transition border-2 border-white flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={20} /> Copied
                </>
              ) : (
                <>
                  <Copy size={20} /> Copy URL
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-gray-400">
            <p>Referral URL: {referralCode && `${window.location.origin}/?ref=${referralCode}`}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border-4 border-white p-6 bg-gray-900">
            <p className="text-gray-400 text-sm uppercase mb-2">Total Referrals</p>
            <p className="text-4xl font-black">{referrals.length}</p>
          </div>
          <div className="border-4 border-white p-6 bg-gray-900">
            <p className="text-gray-400 text-sm uppercase mb-2">Redeemed</p>
            <p className="text-4xl font-black">{redeemedCount}</p>
          </div>
          <div className="border-4 border-white p-6 bg-gray-900">
            <p className="text-gray-400 text-sm uppercase mb-2">Bonus Credits</p>
            <p className="text-4xl font-black">{bonusCredits}</p>
          </div>
        </div>

        {/* Referral List */}
        {referrals.length > 0 && (
          <div className="border-4 border-white p-6 bg-gray-900">
            <h2 className="text-2xl font-black uppercase mb-4">Your Referrals</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className={`p-4 border-l-4 ${
                    referral.status === 'redeemed'
                      ? 'border-green-500 bg-green-950'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase">{referral.referral_code}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 font-bold uppercase text-xs ${
                      referral.status === 'redeemed'
                        ? 'bg-green-500 text-black'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="border-4 border-gray-600 p-6 bg-gray-950">
          <h3 className="font-black uppercase mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Share your referral code with friends</li>
            <li>• When they sign up using your code, you both get 50 bonus credits</li>
            <li>• No limits on how many friends you can refer</li>
            <li>• Credits are added immediately upon signup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
