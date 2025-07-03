import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ReactNode } from "react";
import { ThemeProvider } from 'next-themes';
import ClientLayout from '@/components/common/ClientLayout';
import StructuredData, { organizationSchema, softwareApplicationSchema } from '@/components/seo/StructuredData';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: "FlowHR - Comprehensive HR Management System",
    template: "%s | FlowHR"
  },
  description: "Advanced HR Management System for modern businesses. Streamline employee management, leave requests, attendance tracking, and team collaboration with FlowHR's intuitive platform.",
  keywords: [
    "HR Management System",
    "Employee Management",
    "Leave Management", 
    "Attendance Tracking",
    "Human Resources",
    "Workforce Management",
    "Team Management",
    "HR Software",
    "Employee Portal",
    "HR Analytics"
  ],
  authors: [{ name: "FlowHR Team" }],
  creator: "FlowHR",
  publisher: "FlowHR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flow-hr-seven.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flow-hr-seven.vercel.app',
    title: 'FlowHR - Comprehensive HR Management System',
    description: 'Advanced HR Management System for modern businesses. Streamline employee management, leave requests, attendance tracking, and team collaboration.',
    siteName: 'FlowHR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowHR - HR Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowHR - Comprehensive HR Management System',
    description: 'Advanced HR Management System for modern businesses. Streamline employee management, leave requests, attendance tracking.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'fF5CjwQYDtD0WNpW9hCM-vaJGraaIk4GbtUXqxfHZwQ',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-25HRKDMTH9"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-25HRKDMTH9');
          `}
        </Script>/
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <StructuredData data={organizationSchema} />
        <StructuredData data={softwareApplicationSchema} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <AuthProvider>
              <ClientLayout>{children}</ClientLayout>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
