import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "./components/theme-provider"
import Header from './components/header'
import Footer from './components/footer'
import FeedbackPopupSystem from './components/FeedbackForm'
import { Analytics } from "@vercel/analytics/react"
// Change this:

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cuisine | Chandigarh University Hostel Meal Menu',
  description: 'Explore daily hostel meal menus at Chandigarh University featuring nutritious breakfast, lunch, snacks, and dinner options. Plan your meals in advance with our comprehensive food schedule.',
  icons: {
    icon: '/logo.svg',
  },
  keywords: 'Chandigarh University, hostel food, meal menu, breakfast, lunch, dinner, campus dining, CU hostel meals',
  openGraph: {
    title: 'Chandigarh University Hostel Meal Menu',
    description: 'View daily breakfast, lunch, snacks, and dinner menus for Chandigarh University hostels. Plan your campus dining with our regularly updated meal schedules.',
    type: 'website',
    locale: 'en_US',
    url: 'https://devashish.top',
    siteName: 'Cuisine'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chandigarh University Hostel Meal Menu',
    description: "'Discover what's on the menu at Chandigarh University hostels. Daily breakfast, lunch, snacks, and dinner options all in one place.',"
  }
}
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

          <Header />
          <FeedbackPopupSystem />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}