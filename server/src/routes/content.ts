import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/content/how-it-works
router.get('/how-it-works', (req: Request, res: Response) => {
  res.json({
    steps: [
      { id: 'step-1', iconType: 'Star', title: 'Subscribe', desc: 'Join for just ₹1,049/month and become part of something bigger.', link: '/signup' },
      { id: 'step-2', iconType: 'Target', title: 'Play & Score', desc: 'Enter your last 5 Stableford scores — they become your draw numbers.', link: '/dashboard' },
      { id: 'step-3', iconType: 'Gift', title: 'Win & Give', desc: 'Match 3+ numbers to win. A portion always goes to your chosen charity.', link: '/charities' }
    ]
  });
});

export default router;
