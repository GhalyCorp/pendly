import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    console.log('Check Stripe Account Status API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { stripeAccountId } = body;

    if (!stripeAccountId || typeof stripeAccountId !== 'string') {
      console.error('Invalid Stripe account ID:', stripeAccountId);
      return NextResponse.json({ error: 'Invalid Stripe account ID' }, { status: 400 });
    }

    console.log('Checking Stripe account status for:', stripeAccountId);

    // Retrieve the account from Stripe to get the current status
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    console.log('Stripe account details:', {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    });

    // Determine the status based on Stripe's account state
    let status = 'pending';
    let message = 'Account is being reviewed by Stripe';
    
    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active';
      message = 'Account is fully active and ready to receive payments';
    } else if (account.details_submitted) {
      status = 'pending';
      message = 'Account details submitted, waiting for Stripe review';
    } else {
      status = 'incomplete';
      message = 'Account setup incomplete - needs more information';
    }

    // Check for specific requirements that might be missing
    const requirements = account.requirements;
    let missingRequirements: string[] = [];
    
    if (requirements?.currently_due && requirements.currently_due.length > 0) {
      missingRequirements = requirements.currently_due;
    }
    
    if (requirements?.eventually_due && requirements.eventually_due.length > 0) {
      missingRequirements = [...missingRequirements, ...requirements.eventually_due];
    }

    return NextResponse.json({ 
      stripeAccountId: account.id,
      status,
      message,
      account: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: requirements,
        missingRequirements: missingRequirements,
      }
    });
    
  } catch (error) {
    console.error('Error checking Stripe account status:', error);
    return NextResponse.json({ 
      error: 'Failed to check Stripe account status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 