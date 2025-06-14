// src/types/morgan.d.ts
import { Request, Response } from 'express';

declare module 'morgan' {
  interface Morgan {
    token(name: string, callback: (req: Request, res: Response) => string): Morgan;
  }
}
