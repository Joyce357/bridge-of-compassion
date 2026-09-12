import type { Metadata } from 'next'
import './globals.css'
import { getBaseUrl } from '@/lib/seo'
import { DEFAULT_SITE_SETTINGS } from '@/lib/settings'

// ─── Global Metadata ──────────────────────────────────────────────────────────
// SiteSettings is the single source of truth for SEO title and description.
// The OG image is omitted until an approved 1200×630 social share asset is provided.
// metadataBase is driven by NEXT_PUBLIC_SITE_URL — must be set in production.

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: DEFAULT_SITE_SETTINGS.seoTitle!,
    template: '%s | Bridge of Compassion',
  },
  description: DEFAULT_SITE_SETTINGS.seoDescription!,
  applicationName: 'Bridge of Compassion',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'Bridge of Compassion',
    title: DEFAULT_SITE_SETTINGS.seoTitle!,
    description: DEFAULT_SITE_SETTINGS.seoDescription!,
    // DEFAULT OG IMAGE: WAITING FOR FINAL APPROVED SOCIAL SHARE ASSET
    // Add images array here once a 1200×630 asset is provided and placed in /public/images/
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SITE_SETTINGS.seoTitle!,
    description: DEFAULT_SITE_SETTINGS.seoDescription!,
    // No Twitter/X handle — not yet configured
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { ThemeProvider } from '@/context/ThemeContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('boc_theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'dark' || (!storedTheme && supportDarkMode) || (storedTheme === 'system' && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-brand-warm-white text-text-primary dark:bg-dark-bg dark:text-dark-text-primary transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

