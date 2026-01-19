import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/scores
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', req.userId)
      .order('play_date', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json({ scores: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scores
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { score, playDate } = req.body;

    // Validate score range
    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45' });
    }

    if (!playDate) {
      return res.status(400).json({ error: 'Play date is required' });
    }

    // Check subscription
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    if (!sub) {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    // Check duplicate date
    const { data: existingDate } = await supabaseAdmin
      .from('scores')
      .select('id')
      .eq('user_id', req.userId)
      .eq('play_date', playDate)
      .single();

    if (existingDate) {
      return res.status(409).json({ error: 'Score already exists for this date' });
    }

    // Get current scores count
    const { data: currentScores } = await supabaseAdmin
      .from('scores')
      .select('id, play_date')
      .eq('user_id', req.userId)
      .order('play_date', { ascending: true });

    // If 5 scores exist, delete the oldest
    if (currentScores && currentScores.length >= 5) {
      await supabaseAdmin
        .from('scores')
        .delete()
        .eq('id', currentScores[0].id);
    }

    // Insert new score
    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert({
        user_id: req.userId,
        score: Math.round(score),
        play_date: playDate,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ score: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/scores/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
