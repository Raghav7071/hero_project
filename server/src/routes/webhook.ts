import { Router, Request, Response } from 'express';
import express from 'express';
import { stripe } from '../config/stripe';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Stripe webhooks need raw body
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook sig error:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;

        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string) as any;

          await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: sub.id,
            stripe_price_id: sub.items?.data?.[0]?.price?.id || '',
            plan_type: planType || 'monthly',
            status: 'active',
            current_period_start: new Date((sub.current_period_start || 0) * 1000).toISOString(),
            current_period_end: new Date((sub.current_period_end || 0) * 1000).toISOString(),
          }, { onConflict: 'stripe_subscription_id' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        await supabaseAdmin.from('subscriptions').update({
          status: sub.status === 'active' ? 'active' : 'past_due',
          current_period_start: new Date((sub.current_period_start || 0) * 1000).toISOString(),
          current_period_end: new Date((sub.current_period_end || 0) * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        await supabaseAdmin.from('subscriptions').update({ status: 'cancelled' }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as any;
        if (inv.subscription) {
          await supabaseAdmin.from('subscriptions').update({ status: 'past_due' }).eq('stripe_subscription_id', inv.subscription);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  res.json({ received: true });
});

export default router;
