import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.profile.title,
  description: pageMetadata.profile.description,
  keywords: pageMetadata.profile.keywords,
  canonical: '/profile',
  ogType: 'website'
})

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
