import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, unknown>
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Predefined structured data schemas
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FlowHR",
  "description": "Comprehensive HR Management System for modern businesses",
  "url": "https://flow-hr-seven.vercel.app",
  "logo": "https://flow-hr-seven.vercel.app/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@flowhr.com"
  },
  "sameAs": [
    "https://twitter.com/flowhr",
    "https://linkedin.com/company/flowhr"
  ]
}

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FlowHR",
  "description": "Advanced HR Management System for modern businesses. Streamline employee management, leave requests, attendance tracking, and team collaboration.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "0",
    "description": "Free HR Management System"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150",
    "bestRating": "5"
  },
  "author": {
    "@type": "Organization",
    "name": "FlowHR Team"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2025-01-01",
  "inLanguage": ["en", "ar", "tr"],
  "featureList": [
    "Employee Management",
    "Leave Management", 
    "Attendance Tracking",
    "HR Reports & Analytics",
    "Team Collaboration",
    "Multi-language Support",
    "Dark/Light Mode",
    "Mobile Responsive"
  ]
}

export const breadcrumbListSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://flow-hr-seven.vercel.app${item.url}`
  }))
})

export const faqPageSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
})

export const webPageSchema = (
  title: string, 
  description: string, 
  url: string,
  breadcrumbs?: Array<{name: string, url: string}>
) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": `https://flow-hr-seven.vercel.app${url}`,
  "isPartOf": {
    "@type": "WebSite",
    "name": "FlowHR",
    "url": "https://flow-hr-seven.vercel.app"
  },
  "breadcrumb": breadcrumbs ? breadcrumbListSchema(breadcrumbs) : undefined,
  "about": {
    "@type": "Thing",
    "name": "HR Management System"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Business"
  }
})
