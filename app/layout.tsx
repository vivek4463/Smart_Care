import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import VoiceAssistant from '@/components/VoiceAssistant';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Smart Care - AI Music Therapy',
    description: 'A multimodal, personalized, voice-interactive AI music therapy system',
    keywords: ['AI', 'music therapy', 'emotion detection', 'mental health', 'wellness'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="animated-bg min-h-screen">
                {children}
                <VoiceAssistant />
            </body>
        </html>
    );
}
