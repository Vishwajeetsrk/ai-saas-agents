import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function generateReferralCode(userId: string): Promise<string> {
  const supabase = await createClient();
  let code = '';
  let exists = true;

  // Generate unique referral code
  while (exists) {
    code = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .substring(0, 6);
    const { data } = await supabase
      .from('referrals')
      .select('id')
      .eq('referral_code', code)
      .single();
    exists = !!data;
  }

  return code;
}

export async function createReferral(
  referrerId: string,
  referredEmail?: string,
): Promise<string> {
  const supabase = await createClient();
  const code = await generateReferralCode(referrerId);

  const { error } = await supabase.from('referrals').insert({
    referrer_id: referrerId,
    referral_code: code,
    status: referredEmail ? 'pending' : 'active',
  });

  if (error) {
    throw new Error(`Failed to create referral: ${error.message}`);
  }

  return code;
}

export async function redeemReferral(
  referralCode: string,
  newUserId: string,
): Promise<{ success: boolean; bonusCredits?: number }> {
  const supabase = await createClient();

  // Find referral
  const { data: referral, error: referralError } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', referralCode.toUpperCase())
    .single();

  if (referralError || !referral) {
    return { success: false };
  }

  // Update referral
  await supabase
    .from('referrals')
    .update({
      referred_user_id: newUserId,
      status: 'redeemed',
      redeemed_at: new Date(),
    })
    .eq('id', referral.id);

  // Add bonus credits to both referrer and referred
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Bonus for referred user
  await supabase.from('user_credits').insert({
    user_id: newUserId,
    credits: 50, // Signup bonus
    used_credits: 0,
    billing_cycle_start: now,
    billing_cycle_end: nextMonth,
  });

  // Bonus for referrer
  const { data: referrerCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', referral.referrer_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (referrerCredits) {
    await supabase
      .from('user_credits')
      .update({
        credits: referrerCredits.credits + 50,
      })
      .eq('id', referrerCredits.id);
  } else {
    await supabase.from('user_credits').insert({
      user_id: referral.referrer_id,
      credits: 50,
      used_credits: 0,
      billing_cycle_start: now,
      billing_cycle_end: nextMonth,
    });
  }

  return { success: true, bonusCredits: 50 };
}

export async function generateAffiliateCode(userId: string): Promise<string> {
  const supabase = await createClient();
  let code = '';
  let exists = true;

  // Generate unique affiliate code
  while (exists) {
    code = `aff_${crypto
      .randomBytes(6)
      .toString('hex')
      .toLowerCase()}`;
    const { data } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', code)
      .single();
    exists = !!data;
  }

  // Create affiliate record
  await supabase.from('affiliates').insert({
    user_id: userId,
    affiliate_code: code,
    commission_rate: 20.0,
    status: 'active',
  });

  return code;
}

export async function recordAffiliateTransaction(
  affiliateCode: string,
  customerId: string,
  amount: number,
  transactionType: 'subscription' | 'credit_purchase',
  stripeChargeId?: string,
): Promise<void> {
  const supabase = await createClient();

  // Get affiliate
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('affiliate_code', affiliateCode)
    .single();

  if (!affiliate) {
    throw new Error('Invalid affiliate code');
  }

  const commissionAmount = (amount * affiliate.commission_rate) / 100;

  // Record transaction
  await supabase.from('affiliate_transactions').insert({
    affiliate_id: affiliate.id,
    customer_id: customerId,
    amount,
    commission_amount: commissionAmount,
    transaction_type: transactionType,
    stripe_charge_id: stripeChargeId,
    status: 'pending',
  });

  // Update affiliate total commissions
  await supabase
    .from('affiliates')
    .update({
      total_commissions: (affiliate.total_commissions || 0) + commissionAmount,
    })
    .eq('id', affiliate.id);
}

export async function trackAffiliateConversion(
  affiliateCode: string,
  customerId: string,
  amount: number,
): Promise<void> {
  await recordAffiliateTransaction(
    affiliateCode,
    customerId,
    amount,
    'subscription',
  );
}
