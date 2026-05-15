import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acpi',
});

export async function createCheckoutSession(
  userId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const supabase = await createClient();

  // Get plan details
  const { data: plan } = await supabase
    .from('billing_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (!plan || !plan.monthly_price) {
    throw new Error('Invalid plan');
  }

  // Get or create customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const session = await stripe.checkout.sessions.create({
    customer_email: profile?.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: Math.round(plan.monthly_price * 100),
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
  });

  return session.url || '';
}

export async function createCreditCheckout(
  userId: string,
  packageId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const supabase = await createClient();

  // Get package details
  const { data: creditPackage } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (!creditPackage) {
    throw new Error('Invalid credit package');
  }

  // Get user email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  const session = await stripe.checkout.sessions.create({
    customer_email: profile?.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${creditPackage.credits} Credits`,
            description: creditPackage.description,
          },
          unit_amount: Math.round(creditPackage.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      packageId,
      type: 'credits',
    },
  });

  return session.url || '';
}

export async function handleSuccessfulSubscription(
  userId: string,
  planId: string,
  stripeSubscriptionId: string,
): Promise<void> {
  const supabase = await createClient();

  // Create subscription record
  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_id: planId,
    stripe_subscription_id: stripeSubscriptionId,
    status: 'active',
  });

  // Get plan to add initial credits
  const { data: plan } = await supabase
    .from('billing_plans')
    .select('monthly_credits')
    .eq('id', planId)
    .single();

  if (plan) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabase.from('user_credits').insert({
      user_id: userId,
      credits: plan.monthly_credits,
      used_credits: 0,
      billing_cycle_start: now,
      billing_cycle_end: nextMonth,
    });
  }
}

export async function handleSuccessfulCreditPurchase(
  userId: string,
  packageId: string,
  stripeChargeId: string,
): Promise<void> {
  const supabase = await createClient();

  // Get package details
  const { data: creditPackage } = await supabase
    .from('credit_packages')
    .select('credits')
    .eq('id', packageId)
    .single();

  if (!creditPackage) {
    throw new Error('Invalid credit package');
  }

  // Get current credit allocation
  const { data: currentCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (currentCredits) {
    // Add to existing allocation
    await supabase
      .from('user_credits')
      .update({
        credits: currentCredits.credits + creditPackage.credits,
        stripe_invoice_id: stripeChargeId,
      })
      .eq('id', currentCredits.id);
  } else {
    // Create new allocation
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabase.from('user_credits').insert({
      user_id: userId,
      credits: creditPackage.credits,
      used_credits: 0,
      billing_cycle_start: now,
      billing_cycle_end: nextMonth,
      stripe_invoice_id: stripeChargeId,
    });
  }
}
