import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

function generateDrawNumbers(): number[] {
  const numbers: Set<number> = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// POST /api/draw/execute (admin only)
router.post('/execute', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { drawDate, algorithm = 'random', simulate = false } = req.body;

    if (!drawDate) {
      return res.status(400).json({ error: 'Draw date is required' });
    }

    const winningNumbers = generateDrawNumbers();

    // Get all user scores grouped by user
    const { data: allScores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')
      .order('play_date', { ascending: false });

    const userScoresMap = new Map<string, number[]>();
    if (allScores) {
      for (const s of allScores) {
        if (!userScoresMap.has(s.user_id)) userScoresMap.set(s.user_id, []);
        const scores = userScoresMap.get(s.user_id)!;
        if (scores.length < 5) scores.push(s.score);
      }
    }

    const eligible = Array.from(userScoresMap.entries()).filter(([_, s]) => s.length === 5);

    // Get active subscriber count for prize pool
    const { count: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    const prizePool = (activeSubs || 0) * 9.99 * 0.9;

    // Previous rollover
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('jackpot_rollover')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single();

    const rollover = lastDraw?.jackpot_rollover || 0;
    const totalPool = prizePool + rollover;
    const dist = { fiveMatch: totalPool * 0.4, fourMatch: totalPool * 0.35, threeMatch: totalPool * 0.25 };

    // Match results
    const results: { userId: string; matched: number[]; count: number }[] = [];
    for (const [userId, scores] of eligible) {
      const matched = scores.filter(s => winningNumbers.includes(s));
      if (matched.length >= 3) results.push({ userId, matched, count: matched.length });
    }

    const five = results.filter(r => r.count === 5);
    const four = results.filter(r => r.count === 4);
    const three = results.filter(r => r.count === 3);
    const jackpotRollover = five.length === 0 ? dist.fiveMatch + rollover : 0;

    if (simulate) {
      return res.json({
        simulation: true, winningNumbers, totalParticipants: eligible.length,
        prizePool: totalPool, distribution: dist, jackpotRollover,
        results: { fiveMatch: five.length, fourMatch: four.length, threeMatch: three.length },
      });
    }

    // Create draw
    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .insert({
        draw_date: drawDate, status: 'published', algorithm, winning_numbers: winningNumbers,
        prize_pool: totalPool, jackpot_rollover: jackpotRollover,
        total_participants: eligible.length, published_at: new Date().toISOString(),
      })
      .select().single();

    if (error) throw error;

    // Create results + winners
    for (const r of results) {
      let prize = 0;
      if (r.count === 5 && five.length > 0) prize = dist.fiveMatch / five.length;
      else if (r.count === 4 && four.length > 0) prize = dist.fourMatch / four.length;
      else if (r.count === 3 && three.length > 0) prize = dist.threeMatch / three.length;

      const { data: drawResult } = await supabaseAdmin
        .from('draw_results')
        .insert({ draw_id: draw.id, user_id: r.userId, matched_numbers: r.matched, match_count: r.count, prize_amount: prize })
        .select().single();

      if (drawResult && prize > 0) {
        await supabaseAdmin.from('winners').insert({
          draw_result_id: drawResult.id, user_id: r.userId, draw_id: draw.id, prize_amount: prize,
        });
      }
    }

    res.json({ success: true, draw, winningNumbers, results: { fiveMatch: five.length, fourMatch: four.length, threeMatch: three.length } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/draw/results (public - published draws)
router.get('/results', async (_req, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(12);

    res.json({ draws: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/draw/my-results
router.get('/my-results', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data } = await supabaseAdmin
      .from('draw_results')
      .select('*, draws:draw_id(draw_date, winning_numbers)')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    res.json({ results: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
