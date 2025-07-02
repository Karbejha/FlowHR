import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.settings.title,
  description: pageMetadata.settings.description,
  keywords: pageMetadata.settings.keywords,
  canonical: '/settings',
  ogType: 'website'
})

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
