import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/charity (public)
router.get('/', async (_req, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false });

    res.json({ charities: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/charity/:slug
router.get('/:slug', async (req, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (!data) return res.status(404).json({ error: 'Charity not found' });
    res.json({ charity: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/charity/select
router.post('/select', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { charityId, contributionPct } = req.body;

    if (!charityId) {
      return res.status(400).json({ error: 'Charity ID is required' });
    }

    const pct = Math.max(10, Math.min(100, contributionPct || 10));

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ charity_id: charityId, charity_contribution_pct: pct })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
