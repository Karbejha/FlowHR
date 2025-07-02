import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.calendar.title,
  description: pageMetadata.calendar.description,
  keywords: pageMetadata.calendar.keywords,
  canonical: '/calendar',
  ogType: 'website'
})

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
