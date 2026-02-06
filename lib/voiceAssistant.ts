import { VoiceQuery, VoiceResponse } from './types';

export type Language = 'en' | 'te';

interface NavigationCommand {
    keywords: string[];
    path: string;
    nameEn: string;
    nameTe: string;
}

// Navigation commands mapping
const navigationCommands: NavigationCommand[] = [
    {
        keywords: ['dashboard', 'home', 'డాష్‌బోర్డ్', 'హోమ్'],
        path: '/dashboard',
        nameEn: 'Dashboard',
        nameTe: 'డాష్‌బోర్డ్'
    },
    {
        keywords: ['history', 'session history', 'sessions', 'చరిత్ర', 'సెషన్ చరిత్ర'],
        path: '/history',
        nameEn: 'Session History',
        nameTe: 'సెషన్ చరిత్ర'
    },
    {
        keywords: ['preferences', 'settings', 'ప్రాధాన్యతలు', 'సెట్టింగ్స్'],
        path: '/preferences',
        nameEn: 'Preferences',
        nameTe: 'ప్రాధాన్యతలు'
    },
    {
        keywords: ['detect emotion', 'emotion detection', 'start', 'begin', 'భావోద్వేగ గుర్తింపు', 'ప్రారంభించు'],
        path: '/detect-emotion',
        nameEn: 'Emotion Detection',
        nameTe: 'భావోద్వేగ గుర్తింపు'
    },
];

// Bilingual response templates
const responses = {
    en: {
        welcome: "Hello! I'm your Smart Care assistant. I can help you with emotions, music, navigation, and more! How can I assist you?",
        navigate: (page: string) => `Taking you to ${page}...`,
        help: "I can help you:\n• Detect emotions\n• Generate therapeutic music\n• View session history\n• Adjust preferences\n• Answer questions about Smart Care",
        about: "Smart Care is an AI-powered music therapy system. We analyze your emotions through facial expressions, voice, and text, then generate personalized therapeutic music to support your well-being.",
        howItWorks: "Smart Care works in 4 steps:\n1. Emotion Detection - using face, voice, and text\n2. Music Generation - AI creates personalized music\n3. Music Playback - enjoy therapeutic sounds\n4. Feedback - help us improve",
        emotionDetection: "We detect emotions using:\n• Facial recognition (webcam)\n• Voice analysis (microphone)\n• Text sentiment analysis\n• Optional heart rate monitoring\nEverything happens locally for privacy!",
        musicGeneration: "Our AI generates unique music for each session! We use 13 different instruments like piano, guitar, violin, flute, and more. The tempo, key, and mood are tailored to your emotions.",
        privacy: "Your privacy is paramount. All emotion detection happens on your device. We never upload your images, audio, or personal data to servers.",
        unknown: "I'm not sure I understood that. You can ask me about emotions, music, navigation, or say 'help' to see what I can do!"
    },
    te: {
        welcome: "నమస్కారం! నేను మీ స్మార్ట్ కేర్ అసిస్టెంట్. భావోద్వేగాలు, సంగీతం, నావిగేషన్ మరియు మరిన్నింటిలో నేను మీకు సహాయం చేయగలను! నేను ఎలా సహాయం చేయగలను?",
        navigate: (page: string) => `${page}కు తీసుకెళ్తున్నాను...`,
        help: "నేను మీకు ఇలా సహాయం చేయగలను:\n• భావోద్వేగాలను గుర్తించడం\n• వైద్యపరమైన సంగీతాన్ని సృష్టించడం\n• సెషన్ చరిత్రను చూడడం\n• ప్రాధాన్యతలను సర్దుబాటు చేయడం\n• స్మార్ట్ కేర్ గురించి ప్రశ్నలకు సమాధానం",
        about: "స్మార్ట్ కేర్ ఒక AI-శక్తితో కూడిన సంగీత చికిత్స వ్యవస్థ. మేము ముఖ భావనలు, స్వరం మరియు వచనం ద్వారా మీ భావోద్వేగాలను విశ్లేషిస్తాము, తర్వాత మీ శ్రేయస్సుకు మద్దతుగా వ్యక్తిగతీకరించిన వైద్యపరమైన సంగీతాన్ని సృష్టిస్తాము.",
        howItWorks: "స్మార్ట్ కేర్ 4 దశల్లో పనిచేస్తుంది:\n1. భావోద్వేగ గుర్తింపు - ముఖం, స్వరం మరియు వచనం ఉపయోగించి\n2. సంగీత సృష్టి - AI వ్యక్తిగత సంగీతాన్ని సృష్టిస్తుంది\n3. సంగీత ప్లేబ్యాక్ - వైద్యపరమైన ధ్వనులను ఆస్వాదించండి\n4. అభిప్రాయం - మాకు మెరుగుపరచడంలో సహాయపడండి",
        emotionDetection: "మేము భావోద్వేగాలను ఇలా గుర్తిస్తాము:\n• ముఖ గుర్తింపు (వెబ్‌క్యామ్)\n• స్వర విశ్లేషణ (మైక్రోఫోన్)\n• వచన సెంటిమెంట్ విశ్లేషణ\n• ఐచ్ఛిక హృదయ స్పందన పర్యవేక్షణ\nగోప్యత కోసం అన్నీ స్థానికంగా జరుగుతాయి!",
        musicGeneration: "మా AI ప్రతి సెషన్‌కు ప్రత్యేకమైన సంగీతాన్ని సృష్టిస్తుంది! మేము పియానో, గిటార్, వయోలిన్, వేణువు వంటి 13 వివిధ వాయిద్యాలను ఉపయోగిస్తాము. వేగం, కీ మరియు మానసిక స్థితి మీ భావోద్వేగాలకు అనుకూలంగా ఉంటాయి.",
        privacy: "మీ గోప్యత అత్యంత ముఖ్యమైనది. అన్ని భావోద్వేగ గుర్తింపు మీ పరికరంలోనే జరుగుతుంది. మేము మీ చిత్రాలు, ఆడియో లేదా వ్యక్తిగత డేటాను ఎప్పుడూ సర్వర్‌లకు అప్‌లోడ్ చేయము.",
        unknown: "క్షమించండి, నేను అర్థం చేసుకోలేకపోయాను. మీరు భావోద్వేగాలు, సంగీతం, నావిగేషన్ గురించి అడగవచ్చు లేదా నేను ఏమి చేయగలనో చూడటానికి 'సహాయం' అని చెప్పండి!"
    }
};

// Detect navigation intent
function detectNavigationIntent(query: string): NavigationCommand | null {
    const lowerQuery = query.toLowerCase();

    for (const command of navigationCommands) {
        for (const keyword of command.keywords) {
            if (lowerQuery.includes(keyword.toLowerCase())) {
                return command;
            }
        }
    }

    return null;
}

// Process voice/text query with bilingual support
export async function processVoiceQuery(
    query: VoiceQuery,
    language: Language = 'en',
    onNavigate?: (path: string) => void
): Promise<VoiceResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerQuery = query.text.toLowerCase();
    const lang = responses[language];

    // Check for navigation intent first
    const navIntent = detectNavigationIntent(query.text);
    if (navIntent) {
        const pageName = language === 'te' ? navIntent.nameTe : navIntent.nameEn;

        // Call navigation callback if provided
        if (onNavigate) {
            setTimeout(() => onNavigate(navIntent.path), 1500);
        }

        return {
            text: lang.navigate(pageName),
            timestamp: new Date(),
            action: {
                type: 'navigation',
                path: navIntent.path
            }
        };
    }

    // Information queries
    let responseText = '';

    if (lowerQuery.includes('help') || lowerQuery.includes('సహాయం')) {
        responseText = lang.help;
    } else if (lowerQuery.includes('what') || lowerQuery.includes('about') || lowerQuery.includes('smart care') || lowerQuery.includes('స్మార్ట్ కేర్')) {
        responseText = lang.about;
    } else if (lowerQuery.includes('how') && (lowerQuery.includes('work') || lowerQuery.includes('use') || lowerQuery.includes('పనిచేస్తుంది'))) {
        responseText = lang.howItWorks;
    } else if (lowerQuery.includes('emotion') || lowerQuery.includes('detect') || lowerQuery.includes('భావోద్వేగ')) {
        responseText = lang.emotionDetection;
    } else if (lowerQuery.includes('music') || lowerQuery.includes('generate') || lowerQuery.includes('సంగీత')) {
        responseText = lang.musicGeneration;
    } else if (lowerQuery.includes('privacy') || lowerQuery.includes('data') || lowerQuery.includes('గోప్యత')) {
        responseText = lang.privacy;
    } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('నమస్కారం')) {
        responseText = lang.welcome;
    } else {
        responseText = lang.unknown;
    }

    return {
        text: responseText,
        timestamp: new Date(),
    };
}

// Text-to-speech with language support
export function speak(text: string, language: Language = 'en'): void {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech first for better control
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Improved voice quality settings for gentle, clear speech
        utterance.rate = 0.75;      // Slower for better clarity
        utterance.pitch = 1.1;      // Slightly higher for gentleness
        utterance.volume = 0.85;    // Slightly quieter for pleasant listening

        // Set language
        utterance.lang = language === 'te' ? 'te-IN' : 'en-US';

        // Try to find the best quality voice for the selected language
        const voices = speechSynthesis.getVoices();

        let selectedVoice = null;

        if (language === 'te') {
            // For Telugu, prioritize Google or native Telugu voices
            selectedVoice = voices.find(voice =>
                voice.lang.startsWith('te') &&
                (voice.name.includes('Google') || voice.name.includes('Telugu'))
            ) || voices.find(voice => voice.lang.startsWith('te'));
        } else {
            // For English, prioritize high-quality female voices for gentleness
            selectedVoice =
                voices.find(voice =>
                    voice.lang.startsWith('en') &&
                    voice.name.includes('Google') &&
                    (voice.name.includes('Female') || voice.name.includes('US'))
                ) ||
                voices.find(voice =>
                    voice.lang.startsWith('en') &&
                    (voice.name.includes('Samantha') || voice.name.includes('Female'))
                ) ||
                voices.find(voice =>
                    voice.lang.startsWith('en') && voice.name.includes('Google')
                );
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Add pauses between sentences for better comprehension
        const textWithPauses = text.replace(/\n/g, '. ').replace(/\.\s\s/g, '. ... ');
        utterance.text = textWithPauses;

        speechSynthesis.speak(utterance);
    }
}

// Speech recognition with language support
export function startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    language: Language = 'en'
): { stop: () => void } | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        onError?.('Speech recognition is not supported in your browser');
        return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'te' ? 'te-IN' : 'en-US';

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
    };

    recognition.onerror = (event: any) => {
        onError?.(event.error);
    };

    recognition.start();

    return {
        stop: () => recognition.stop(),
    };
}
