import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  noIndex?: boolean
  ogImage?: string
  ogType?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  section?: string
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  canonical,
  noIndex = false,
  ogImage = '/og-image.png',
  ogType = 'website',
  publishedTime,
  modifiedTime,
  section
}: SEOProps): Metadata {
  const baseUrl = 'https://flow-hr-seven.vercel.app'
  const fullTitle = title ? `${title} | FlowHR` : 'FlowHR - Comprehensive HR Management System'
  const fullDescription = description || 'Advanced HR Management System for modern businesses. Streamline employee management, leave requests, attendance tracking, and team collaboration.'
  
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl
  
  const combinedKeywords = [
    'HR Management System',
    'Employee Management',
    'Leave Management',
    'Attendance Tracking',
    'Human Resources',
    'Workforce Management',
    ...keywords
  ]

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: combinedKeywords,
    alternates: {
      canonical: fullCanonical,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: fullCanonical,
      title: fullTitle,
      description: fullDescription,
      siteName: 'FlowHR',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || 'FlowHR - HR Management System',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }

  return metadata
}

// Common page metadata configurations
export const pageMetadata = {
  home: {
    title: 'Home - HR Management Dashboard',
    description: 'Access your HR dashboard to manage employees, track attendance, process leave requests, and view comprehensive reports.',
    keywords: ['hr dashboard', 'employee portal', 'attendance dashboard', 'leave management dashboard']
  },
  employees: {
    title: 'Employee Management',
    description: 'Manage your workforce with comprehensive employee profiles, role assignments, and team organization tools.',
    keywords: ['employee management', 'staff directory', 'team management', 'employee profiles']
  },
  leave: {
    title: 'Leave Management',
    description: 'Submit, track, and manage leave requests with our streamlined approval workflow and leave balance tracking.',
    keywords: ['leave requests', 'vacation management', 'time off', 'leave balance', 'pto management']
  },
  attendance: {
    title: 'Attendance Tracking',
    description: 'Monitor employee attendance, clock-in/out times, work hours, and generate attendance reports.',
    keywords: ['attendance tracking', 'time tracking', 'clock in out', 'work hours', 'timesheet']
  },
  reports: {
    title: 'HR Reports & Analytics',
    description: 'Generate comprehensive reports on employee demographics, attendance patterns, leave usage, and resource allocation.',
    keywords: ['hr reports', 'hr analytics', 'workforce analytics', 'employee reports', 'attendance reports']
  },
  calendar: {
    title: 'HR Calendar',
    description: 'View company holidays, important dates, and team schedules in an organized calendar interface.',
    keywords: ['hr calendar', 'company holidays', 'work calendar', 'team schedule']
  },
  helpCenter: {
    title: 'Help Center',
    description: 'Find comprehensive guides, tutorials, and support documentation for using FlowHR effectively.',
    keywords: ['hr help', 'user guide', 'hr support', 'documentation', 'tutorials']
  },
  profile: {
    title: 'User Profile',
    description: 'Manage your personal information, preferences, and account settings.',
    keywords: ['user profile', 'account settings', 'personal information']
  },
  settings: {
    title: 'System Settings',
    description: 'Configure system preferences, notifications, and administrative settings.',
    keywords: ['system settings', 'preferences', 'configuration']
  },
  notifications: {
    title: 'Notifications',
    description: 'View and manage your HR notifications, alerts, and important updates.',
    keywords: ['notifications', 'alerts', 'updates', 'messages']
  }
}
