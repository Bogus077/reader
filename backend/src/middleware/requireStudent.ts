import { Request, Response, NextFunction } from 'express';
export function requireStudent(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).user?.role;
  if (role !== 'student') return res.status(403).json({ ok:false, error:'Student only' });
  next();
}
export default requireStudent;
