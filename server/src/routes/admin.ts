import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/analytics
router.get('/analytics', async (_req, res: Response) => {
  try {
    const [usersRes, subsRes, winnersRes, drawsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
      supabaseAdmin.from('subscriptions').select('id, status'),
      supabaseAdmin.from('winners').select('id, prize_amount, verification_status, payment_status'),
      supabaseAdmin.from('draws').select('*').order('draw_date', { ascending: false }).limit(10),
    ]);

    const activeSubs = subsRes.data?.filter(s => s.status === 'active').length || 0;
    const totalPaid = winnersRes.data?.filter(w => w.payment_status === 'paid').reduce((s, w) => s + w.prize_amount, 0) || 0;
    const pending = winnersRes.data?.filter(w => w.verification_status === 'pending').length || 0;

    res.json({
      totalUsers: usersRes.count || 0,
      activeSubscriptions: activeSubs,
      monthlyRevenue: activeSubs * 9.99,
      totalPrizesPaid: totalPaid,
      pendingVerifications: pending,
      recentDraws: drawsRes.data || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (_req, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('*, subscriptions(status, plan_type), charities:charity_id(name)')
      .order('created_at', { ascending: false });

    res.json({ users: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await supabaseAdmin.from('profiles').update({ role }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/winners
router.get('/winners', async (_req, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('winners')
      .select('*, profiles:user_id(full_name, email), draws:draw_id(draw_date)')
      .order('created_at', { ascending: false });

    res.json({ winners: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/winners/:id
router.patch('/winners/:id', async (req, res: Response) => {
  try {
    const { action, notes } = req.body;
    const updates: Record<string, any> = { admin_notes: notes };

    if (action === 'approve') {
      updates.verification_status = 'approved';
      updates.verified_at = new Date().toISOString();
    } else if (action === 'reject') {
      updates.verification_status = 'rejected';
      updates.verified_at = new Date().toISOString();
    } else if (action === 'pay') {
      updates.payment_status = 'paid';
      updates.paid_at = new Date().toISOString();
    }

    await supabaseAdmin.from('winners').update(updates).eq('id', req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/charities
router.post('/charities', async (req, res: Response) => {
  try {
    const { name, description, longDescription, category, websiteUrl, isFeatured } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert({ name, slug, description, long_description: longDescription, category, website_url: websiteUrl, is_featured: isFeatured || false, is_active: true })
      .select().single();

    if (error) throw error;
    res.status(201).json({ charity: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/charities/:id
router.delete('/charities/:id', async (req, res: Response) => {
  try {
    await supabaseAdmin.from('charities').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
