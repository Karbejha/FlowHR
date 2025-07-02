import { Suspense } from 'react'
import Script from 'next/script'

// Preload critical resources
export function PreloadResources() {
  return (
    <>
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* Preload critical images */}
      <link rel="preload" href="/logo.png" as="image" />
      <link rel="preload" href="/og-image.png" as="image" />
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//flowhr.s3.eu-north-1.amazonaws.com" />
      
      {/* Preconnect to important third-party origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </>
  )
}

// Analytics and tracking scripts (load after page is interactive)
export function AnalyticsScripts() {
  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        `}
      </Script>

      {/* Schema.org structured data for monitoring */}
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "FlowHR",
            "description": "Comprehensive HR Management System",
            "url": "https://flow-hr-seven.vercel.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://flow-hr-seven.vercel.app/help-center?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </>
  )
}

// Critical CSS for above-the-fold content
export function CriticalCSS() {
  return (
    <style jsx global>{`
      /* Critical CSS for immediate rendering */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        color: #1f2937;
      }
      
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #111827;
          color: #f9fafb;
        }
      }
      
      /* Loading state */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Improve layout shift */
      .page-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      
      /* Critical navigation styles */
      .navigation {
        height: 64px;
        background-color: #374151;
        border-bottom: 1px solid #4b5563;
      }
      
      @media (prefers-color-scheme: dark) {
        .navigation {
          background-color: #1f2937;
          border-bottom-color: #374151;
        }
      }
    `}</style>
  )
}

// SEO-friendly loading component
export function SEOLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="loading-skeleton h-12 w-12 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading FlowHR...</p>
        <noscript>
          <p className="mt-4 text-red-600">
            Please enable JavaScript to use FlowHR HR Management System.
          </p>
        </noscript>
      </div>
    </div>
  )
}

// Error boundary for SEO
export function SEOErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SEOLoading />}>
      {children}
    </Suspense>
  )
}
