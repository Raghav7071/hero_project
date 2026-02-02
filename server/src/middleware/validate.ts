import { Request, Response, NextFunction } from 'express';

export function validate(schema: {
  body?: Record<string, { type: string; required?: boolean; min?: number; max?: number }>;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schema.body) {
      const errors: string[] = [];
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} is required`);
          continue;
        }
        if (value !== undefined) {
          if (rules.type === 'number' && typeof value !== 'number') {
            errors.push(`${field} must be a number`);
          }
          if (rules.type === 'string' && typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          }
          if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
            errors.push(`${field} must be at least ${rules.min}`);
          }
          if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
            errors.push(`${field} must be at most ${rules.max}`);
          }
        }
      }
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
    }
    next();
  };
}
