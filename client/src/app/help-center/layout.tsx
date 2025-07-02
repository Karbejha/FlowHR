import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.helpCenter.title,
  description: pageMetadata.helpCenter.description,
  keywords: pageMetadata.helpCenter.keywords,
  canonical: '/help-center',
  ogType: 'website'
})

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
