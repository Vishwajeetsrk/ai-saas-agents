import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, createCreditCheckout } from '@/lib/billing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, planId, packageId } = body;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let checkoutUrl: string;

    if (type === 'subscription' && planId) {
      checkoutUrl = await createCheckoutSession(
        userId,
        planId,
        `${origin}/dashboard?success=true`,
        `${origin}/billing`,
      );
    } else if (type === 'credits' && packageId) {
      checkoutUrl = await createCreditCheckout(
        userId,
        packageId,
        `${origin}/dashboard?credits=added`,
        `${origin}/billing`,
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid checkout type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[Checkout Error]', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
