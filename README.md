# Smart Care - AI Music Therapy System

A multimodal, personalized, voice-interactive AI music therapy system that detects emotions through face, voice, text analysis and generates therapeutic music tailored to improve emotional well-being.

## 🎯 Features

- **Multimodal Emotion Detection**: Face landmarks, voice prosody, text sentiment, and heart rate analysis
- **Professional Music Generation**: Chord progressions, melody synthesis, harmony, and bass lines with reverb/delay effects
- **Voice Assistant**: Interactive voice guidance using Web Speech API
- **Feedback System**: Continuous learning from user ratings
- **Modern UI/UX**: Dark teal/cyan theme with glassmorphism effects and Framer Motion animations

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## 📚 Documentation

### Core Documentation Files

1. **[SYSTEM_DOCUMENTATION.md](file:///C:/Users/DELL/.gemini/antigravity/brain/1cc0144b-e7d7-46d8-ac02-bf826fd77041/SYSTEM_DOCUMENTATION.md)** - Complete system architecture, technology stack, and component breakdown
2. **[ALGORITHMS_DOCUMENTATION.md](file:///C:/Users/DELL/.gemini/antigravity/brain/1cc0144b-e7d7-46d8-ac02-bf826fd77041/ALGORITHMS_DOCUMENTATION.md)** - Detailed algorithms, code implementations, pseudocode, and mathematical formulas
3. **[walkthrough.md](file:///C:/Users/DELL/.gemini/antigravity/brain/1cc0144b-e7d7-46d8-ac02-bf826fd77041/walkthrough.md)** - Authentication fix and UI redesign walkthrough

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14 + TypeScript | App routing, SSR, type safety |
| Styling | Tailwind CSS + Framer Motion | Responsive UI, animations |
| Audio | Tone.js 15.0 | Music synthesis, ADSR envelopes, effects |
| ML | TensorFlow.js + FaceMesh | Face landmark detection |
| Voice | Web Speech API | Speech recognition, TTS |
| Bluetooth | Web Bluetooth API | Heart rate monitoring |

## 🎵 Music Generation

### Therapeutic Approach

Music is generated to **improve mood**, not match it:

- **Sad** → Uplifting music (75 BPM, C Major, Piano/Harp/Flute)
- **Angry** → Calming music (85 BPM, G Major, Piano/Flute/Bell)
- **Fearful** → Comforting music (70 BPM, C Major, Piano/Harp/Bell)
- **Happy** → Maintaining positivity (105 BPM, C Major, Piano/Guitar/Harp)

### Musical Features

- **Chord Progressions**: I-IV-V-I, I-vi-IV-V, i-iv-V-i
- **Melody Generation**: 16-bar patterns with octave variations
- **Bass Lines**: Root note synchronization with chords
- **Effects**: Reverb (decay: 2.5s, wet: 30%), Delay (8th note, feedback: 20%)
- **Instruments**: Piano, Harp, Flute, Pad, Strings, Bass with ADSR envelopes

## 🧠 Emotion Detection

### Multi-Modal Fusion

```
Aggregated_Emotion = (Face × 0.4) + (Voice × 0.35) + (Text × 0.25) + HeartRate_Adjustment

Weights:
- Face: 40% (most reliable - facial landmarks)
- Voice: 35% (prosodic features - pitch, energy, rate)
- Text: 25% (keyword matching + sentiment)
- Heart Rate: Tempo adjustment (-10 BPM if HR > 90)
```

### Algorithms

1. **Face**: FACS-based landmark analysis (MediaPipe FaceMesh)
2. **Voice**: Prosodic feature extraction (pitch, energy, speaking rate, spectral centroid)
3. **Text**: Keyword matching with negation handling and intensity modifiers
4. **Aggregation**: Weighted fusion with normalization

⚠️ **Note**: Currently using simulated/random emotion detection. Real ML models need to be integrated for production.

## 📁 Project Structure

```
e:\Smart_Care\
├── app/                      # Next.js pages
│   ├── dashboard/           # Main dashboard
│   ├── detect-emotion/      # Emotion detection flow
│   ├── login/               # Authentication (Fixed)
│   ├── music/               # Music player
│   └── globals.css          # Dark teal/cyan theme
│
├── components/              # UI components
│   ├── EmotionDetector/    # Face, Voice, Text, HeartRate
│   ├── MusicPlayer.tsx     # Tone.js playback
│   └── VoiceAssistant.tsx  # Voice interaction
│
├── lib/                     # Core logic
│   ├── authService.ts      # User authentication
│   ├── emotionDetection.ts # Emotion algorithms
│   ├── musicGeneration.ts  # Music synthesis
│   └── types.ts            # TypeScript definitions
│
└── context/                 # React Context
    ├── MoodContext.tsx     # Global mood state
    └── PreferencesContext.tsx
```

## 🔐 Security

### Current Implementation (Development)

- User credentials stored in localStorage (plain text)
- No backend authentication

### Production Requirements

- Hash passwords with bcrypt
- Implement JWT tokens
- Backend API with PostgreSQL/MongoDB
- HTTPS/SSL
- Rate limiting

## 🧪 Testing

### Manual Testing Scenarios

1. **Emotion Detection**:
   - Use webcam for face detection
   - Record 5-10 second voice samples
   - Type emotional text phrases
   - Connect Bluetooth heart rate monitor

2. **Music Generation**:
   - Test each emotion type
   - Verify chord progressions are correct
   - Listen for professional sound quality
   - Check therapeutic appropriateness

3. **Authentication**:
   - Register new user
   - Login with correct credentials
   - Test invalid email/password errors

## 🚧 Known Limitations

1. **Emotion Detection**: Using random values (needs real ML models)
2. **Music Quality**: Synthetic instruments (consider audio samples)
3. **Authentication**: localStorage only (needs backend database)
4. **Browser Support**: Requires modern browsers with Web Audio API

## 📈 Future Improvements

1. Integrate real TensorFlow emotion recognition models
2. Add voice emotion analysis library
3. Use audio samples instead of oscillators
4. Implement backend with proper database
5. Add musical structure (intro, verse, chorus, bridge, outro)
6. Include dynamics and expression controls

## 📄 License

MIT

## 👥 Contributors

Built with ❤️ for emotional wellness through AI-powered music therapy.

---

**For detailed technical documentation, see**:
- [SYSTEM_DOCUMENTATION.md](file:///C:/Users/DELL/.gemini/antigravity/brain/1cc0144b-e7d7-46d8-ac02-bf826fd77041/SYSTEM_DOCUMENTATION.md) - Architecture & Technologies
- [ALGORITHMS_DOCUMENTATION.md](file:///C:/Users/DELL/.gemini/antigravity/brain/1cc0144b-e7d7-46d8-ac02-bf826fd77041/ALGORITHMS_DOCUMENTATION.md) - Algorithms & Code Implementation
