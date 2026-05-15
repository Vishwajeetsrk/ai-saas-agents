'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  monthly_price: number | null;
  monthly_credits: number;
  features: string[];
}

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  description: string;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
}

export default function BillingPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Fetch plans and packages
        const [{ data: plansData }, { data: packagesData }, { data: subData }] = await Promise.all([
          supabase.from('billing_plans').select('*').eq('is_active', true),
          supabase.from('credit_packages').select('*').eq('is_active', true),
          supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single(),
        ]);

        setPlans(plansData || []);
        setPackages(packagesData || []);
        setCurrentSubscription(subData || null);
      }
    };

    fetchData();
  }, [supabase]);

  const handleCheckout = async (type: 'subscription' | 'credits', id: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          planId: type === 'subscription' ? id : undefined,
          packageId: type === 'credits' ? id : undefined,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white border-l-4 border-white">
      {/* Header */}
      <div className="border-b-4 border-white p-6 flex items-center gap-4">
        <Link href="/dashboard" className="hover:opacity-70 transition">
          <ChevronLeft size={32} />
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-wider">Billing</h1>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-12">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className="border-4 border-green-500 p-6 bg-green-950">
            <h2 className="text-2xl font-black uppercase mb-4 text-green-400">Active Subscription</h2>
            <p className="text-green-300">
              You have an active Pro subscription. Next billing date:{' '}
              {new Date(currentSubscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Plans Section */}
        <div>
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-white pb-4">Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`border-4 p-6 ${plan.monthly_price ? 'border-white bg-gray-900' : 'border-gray-600 bg-gray-950'}`}>
                <h3 className="text-2xl font-black uppercase mb-2">{plan.name}</h3>
                <div className="mb-6">
                  {plan.monthly_price ? (
                    <div className="text-5xl font-black">${plan.monthly_price}</div>
                  ) : (
                    <div className="text-3xl font-black text-gray-400">Free</div>
                  )}
                  <p className="text-gray-400 text-sm">{plan.monthly_credits} credits/month</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check size={20} className="text-yellow-400" />
                      <span className="font-bold uppercase text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.monthly_price && !currentSubscription && (
                  <button
                    onClick={() => handleCheckout('subscription', plan.id)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 disabled:opacity-50 transition border-2 border-white"
                  >
                    {isLoading ? 'Processing...' : 'Subscribe'}
                  </button>
                )}
                {currentSubscription && (
                  <button disabled className="w-full px-4 py-3 bg-gray-500 text-black font-bold uppercase cursor-not-allowed border-2 border-gray-500">
                    Current Plan
                  </button>
                )}
                {!plan.monthly_price && !currentSubscription && (
                  <button disabled className="w-full px-4 py-3 bg-gray-500 text-black font-bold uppercase cursor-not-allowed border-2 border-gray-500">
                    You&apos;re on Free
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Credit Packages */}
        <div>
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-white pb-4">Buy Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="border-4 border-white p-6 bg-gray-900">
                <div className="mb-6">
                  <div className="text-4xl font-black">{pkg.credits}</div>
                  <p className="text-gray-400 text-sm">Credits</p>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-black">${pkg.price}</div>
                  <p className="text-gray-400 text-sm">{pkg.description}</p>
                </div>

                <button
                  onClick={() => handleCheckout('credits', pkg.id)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white text-black font-bold uppercase hover:bg-gray-200 disabled:opacity-50 transition border-2 border-white"
                >
                  {isLoading ? 'Processing...' : 'Buy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
