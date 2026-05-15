'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ChevronLeft, Copy, Check } from 'lucide-react';

interface AffiliateData {
  id: string;
  affiliate_code: string;
  commission_rate: number;
  total_commissions: number;
  status: string;
}

interface Transaction {
  id: string;
  amount: number;
  commission_amount: number;
  transaction_type: string;
  status: string;
  created_at: string;
}

export default function AffiliatesPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>('');
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Fetch affiliate data
        const { data: affData } = await supabase
          .from('affiliates')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (affData) {
          setAffiliate(affData);

          // Fetch transactions
          const { data: transData } = await supabase
            .from('affiliate_transactions')
            .select('*')
            .eq('affiliate_id', affData.id)
            .order('created_at', { ascending: false })
            .limit(20);

          setTransactions(transData || []);
        }
      }
    };

    fetchData();
  }, [supabase]);

  const generateAffiliateCode = async () => {
    if (affiliate) return;
    setIsLoading(true);
    try {
      // In production, this would call an API endpoint
      const code = `aff_${Math.random().toString(36).substring(2, 8).toLowerCase()}`;

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: userId,
          affiliate_code: code,
          commission_rate: 20.0,
          status: 'active',
        })
        .select()
        .single();

      if (!error && data) {
        setAffiliate(data);
      }
    } catch (error) {
      console.error('Failed to generate affiliate code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!affiliate) return;
    const affiliateUrl = `${window.location.origin}/?aff=${affiliate.affiliate_code}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingCommissions = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.commission_amount, 0);

  const totalEarned = affiliate?.total_commissions || 0;

  return (
    <div className="min-h-screen bg-black text-white border-l-4 border-white">
      {/* Header */}
      <div className="border-b-4 border-white p-6 flex items-center gap-4">
        <Link href="/dashboard" className="hover:opacity-70 transition">
          <ChevronLeft size={32} />
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-wider">Affiliate Program</h1>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {!affiliate ? (
          <div className="border-4 border-white p-8 bg-gray-900 text-center">
            <h2 className="text-2xl font-black uppercase mb-4">Join Our Affiliate Program</h2>
            <p className="text-gray-400 mb-6">
              Earn 20% commission on every subscription and 15% on credit packages sold through your link.
            </p>
            <button
              onClick={generateAffiliateCode}
              disabled={isLoading}
              className="px-8 py-4 bg-white text-black font-bold uppercase hover:bg-gray-200 disabled:opacity-50 transition border-2 border-white text-lg"
            >
              {isLoading ? 'Generating...' : 'Get Your Code'}
            </button>
          </div>
        ) : (
          <>
            {/* Your Affiliate Code */}
            <div className="border-4 border-white p-8 bg-gray-900">
              <h2 className="text-2xl font-black uppercase mb-6">Your Affiliate Code</h2>
              <p className="text-gray-400 mb-4">Share this link to earn commissions:</p>

              <div className="flex gap-3 mb-6">
                <div className="flex-1 bg-black border-2 border-white p-4 font-mono text-lg font-bold break-all">
                  {`${window.location.origin}/?aff=${affiliate.affiliate_code}`}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-4 bg-white text-black font-bold uppercase hover:bg-gray-200 transition border-2 border-white flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check size={20} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={20} /> Copy
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-700">
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Commission Rate</p>
                  <p className="text-2xl font-black">{affiliate.commission_rate}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Status</p>
                  <p className="text-2xl font-black uppercase text-green-400">{affiliate.status}</p>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-4 border-white p-6 bg-gray-900">
                <p className="text-gray-400 text-sm uppercase mb-2">Total Earned</p>
                <p className="text-4xl font-black">${totalEarned.toFixed(2)}</p>
              </div>
              <div className="border-4 border-yellow-500 p-6 bg-yellow-950">
                <p className="text-yellow-400 text-sm uppercase mb-2">Pending</p>
                <p className="text-4xl font-black">${pendingCommissions.toFixed(2)}</p>
              </div>
            </div>

            {/* Transactions */}
            {transactions.length > 0 && (
              <div className="border-4 border-white p-6 bg-gray-900">
                <h2 className="text-2xl font-black uppercase mb-4">Recent Transactions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-700">
                        <th className="text-left py-2 font-bold uppercase">Date</th>
                        <th className="text-left py-2 font-bold uppercase">Type</th>
                        <th className="text-right py-2 font-bold uppercase">Amount</th>
                        <th className="text-right py-2 font-bold uppercase">Commission</th>
                        <th className="text-center py-2 font-bold uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b-2 border-gray-800">
                          <td className="py-3">{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td className="py-3 uppercase text-xs">{tx.transaction_type}</td>
                          <td className="py-3 text-right">${tx.amount.toFixed(2)}</td>
                          <td className="py-3 text-right font-bold">${tx.commission_amount.toFixed(2)}</td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-1 font-bold uppercase text-xs ${
                                tx.status === 'pending'
                                  ? 'bg-yellow-600 text-yellow-200'
                                  : 'bg-green-600 text-green-200'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="border-4 border-gray-600 p-6 bg-gray-950">
              <h3 className="font-black uppercase mb-3">Commission Structure</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 20% commission on Pro subscriptions ($5.80 per subscription)</li>
                <li>• 15% commission on credit package purchases</li>
                <li>• Commissions track automatically from your affiliate link</li>
                <li>• Payments issued monthly (minimum $50 threshold)</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
