import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redeemReferral } from '@/lib/growth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, userId } = body;

    if (!referralCode || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await redeemReferral(referralCode, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Referral Error]', error);
    return NextResponse.json(
      { error: 'Failed to redeem referral' },
      { status: 500 }
    );
  }
}
