import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import VoiceAssistant from '@/components/VoiceAssistant';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { MoodProvider } from '@/context/MoodContext';
import MoodBackground from '@/components/MoodBackground';

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
                <PreferencesProvider>
                    <MoodProvider>
                        <MoodBackground />
                        {children}
                        <VoiceAssistant />
                    </MoodProvider>
                </PreferencesProvider>
            </body>
        </html>
    );
}
