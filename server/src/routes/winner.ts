import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/winner/my-winnings
router.get('/my-winnings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('winners')
      .select('*, draws:draw_id(draw_date)')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    res.json({ winners: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/winner/upload-proof/:id
router.post('/upload-proof/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { proofImageUrl } = req.body;

    if (!proofImageUrl) {
      return res.status(400).json({ error: 'Proof image URL is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ proof_image_url: proofImageUrl })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Winner record not found' });

    res.json({ winner: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
