import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.attendance.title,
  description: pageMetadata.attendance.description,
  keywords: pageMetadata.attendance.keywords,
  canonical: '/attendance',
  ogType: 'website'
})

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
