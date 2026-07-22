import { MuscleGainCalculator } from '@/components/ffmi-calculator'
import { Metadata } from 'next'

const SOCIAL_BLURBS = {
  title: 'FFMI and Body Composition Calculator',
  description: 'Find out how much muscle you can gain monthly when you train right.',
}

export const metadata: Metadata = {
  title: SOCIAL_BLURBS.title,
  description: SOCIAL_BLURBS.description,
  openGraph: {
    title: SOCIAL_BLURBS.title,
    description: SOCIAL_BLURBS.description,
    type: 'website',
    siteName: SOCIAL_BLURBS.title,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: SOCIAL_BLURBS.title,
    description: SOCIAL_BLURBS.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <main className="container mx-auto px-2 sm:p-4 mt-2 min-h-screen dark:bg-gray-950">
        <MuscleGainCalculator />
      </main>
    </div>
  )
} 