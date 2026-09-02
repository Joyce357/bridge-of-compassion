import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://bridgeofcompassion.org'),
  title: {
    default: 'Bridge of Compassion — Building Bridges, Changing Lives',
    template: '%s | Bridge of Compassion',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  description:
    'Bridge of Compassion is a nonprofit organization dedicated to fostering compassion, strengthening communities, and protecting the natural world. Volunteer, donate, and get involved.',
  keywords: [
    'nonprofit',
    'community',
    'volunteer',
    'donate',
    'compassion',
    'environmental stewardship',
    'community development',
    'Bridge of Compassion',
  ],
  authors: [{ name: 'Bridge of Compassion' }],
  creator: 'Bridge of Compassion',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://bridgeofcompassion.org',
    siteName: 'Bridge of Compassion',
    title: 'Bridge of Compassion — Building Bridges, Changing Lives',
    description:
      'A nonprofit organization dedicated to fostering compassion, strengthening communities, and protecting the natural world.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bridge of Compassion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridge of Compassion',
    description: 'Building bridges of compassion, connection, and community.',
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

