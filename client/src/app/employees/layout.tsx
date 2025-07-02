import { Metadata } from 'next'
import { generateSEOMetadata, pageMetadata } from '@/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: pageMetadata.employees.title,
  description: pageMetadata.employees.description,
  keywords: pageMetadata.employees.keywords,
  canonical: '/employees',
  ogType: 'website'
})

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
