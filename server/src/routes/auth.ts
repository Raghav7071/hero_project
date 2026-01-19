import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create auth user via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: true,
    });

    if (authError) throw authError;

    // Generate JWT
    const token = jwt.sign(
      { userId: authData.user.id, role: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' as any }
    );

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.status(201).json({ token, user: profile });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate via Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Generate JWT
    const token = jwt.sign(
      { userId: data.user.id, role: profile?.role || 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' as any }
    );

    res.json({ token, user: profile });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Also fetch subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    res.json({ user: profile, subscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName } = req.body;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName })
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
