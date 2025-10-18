import { ReactNode } from 'react';

export const metadata = {
  title: 'Payroll Management',
  description: 'Manage employee payroll and salaries'
};

export default function PayrollLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

