import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { VolunteerModalProvider } from '@/context/VolunteerModalContext'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VolunteerModalProvider>
      <Header />
      <main id="main-content" className="flex-1 pt-14 sm:pt-16 lg:pt-[68px]" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </VolunteerModalProvider>
  )
}
