import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.notifications.title,
  description: pageMetadata.notifications.description,
  keywords: pageMetadata.notifications.keywords,
  canonical: '/notifications',
  ogType: 'website'
})

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
