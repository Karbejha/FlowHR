import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.reports.title,
  description: pageMetadata.reports.description,
  keywords: pageMetadata.reports.keywords,
  canonical: '/reports',
  ogType: 'website'
})

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
