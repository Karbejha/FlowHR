import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { ThemeProvider } from 'next-themes';
import ClientLayout from '@/components/common/ClientLayout';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowHR",
  description: "FlowHR Management System for leave and attendance tracking",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
