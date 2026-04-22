import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SmartBo-Pol',
  description: 'AI Accommodation Search in Polangui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}