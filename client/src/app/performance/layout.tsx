'use client';

import { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function PerformanceLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
