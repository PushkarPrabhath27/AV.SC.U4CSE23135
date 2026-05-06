import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ClientThemeProvider from '@/components/ClientThemeProvider';
import { ViewedProvider } from '@/lib/viewedContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Campus Notifications',
    description: 'Real-time placement, event, and result notifications for students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AppRouterCacheProvider>
                    <ClientThemeProvider>
                        <ViewedProvider>
                            {children}
                        </ViewedProvider>
                    </ClientThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
