import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import '../styles/globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'NexIT - Modern ITSM Platform',
  description: 'AI-powered IT Service Management platform for modern enterprises',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
              <a href="/" className="text-xl font-bold tracking-tight text-primary">NexIT</a>
              <nav className="flex items-center gap-4">
                <a href="/" className="text-gray-700 hover:text-primary dark:text-gray-200 text-sm font-medium">Home</a>
                <a href="/login" className="text-gray-700 hover:text-primary dark:text-gray-200 text-sm font-medium">Login</a>
                <a href="/register" className="text-gray-700 hover:text-primary dark:text-gray-200 text-sm font-medium">Register</a>
                <a href="/demo" className="text-gray-700 hover:text-primary dark:text-gray-200 text-sm font-medium">Demo</a>
              </nav>
            </div>
          </header>
          <main className="flex-1 min-h-0">
            {children}
          </main>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
