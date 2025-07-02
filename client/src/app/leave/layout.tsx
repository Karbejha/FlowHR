import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.leave.title,
  description: pageMetadata.leave.description,
  keywords: pageMetadata.leave.keywords,
  canonical: '/leave',
  ogType: 'website'
})

export default function LeaveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
