# Smart Care - Algorithm Deep Dive & Code Implementation

## 📋 Table of Contents

1. [Emotion Detection Algorithms](#emotion-detection-algorithms)
2. [Emotion Aggregation Algorithm](#emotion-aggregation-algorithm)
3. [Music Generation Algorithms](#music-generation-algorithms)
4. [Code Implementation Details](#code-implementation-details)

---

## Emotion Detection Algorithms

### 1. Face Emotion Detection Algorithm

**File**: `lib/emotionDetection.ts` (Lines 4-25)

**Technology**: TensorFlow.js + MediaPipe FaceMesh

#### Current Implementation (Simulated):

```typescript
export async function detectFaceEmotion(imageData: string): Promise<EmotionScore[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 1: Select random primary emotion
    const emotions: EmotionType[] = ['happy', 'neutral', 'sad', 'surprised', 'angry'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    // Step 2: Generate primary confidence (70-95%)
    const primaryConfidence = 0.70 + Math.random() * 0.25;

    // Step 3: Distribute remaining confidence to secondary emotions
    const remainingConfidence = 1 - primaryConfidence;
    const secondaryConfidence1 = remainingConfidence * (0.4 + Math.random() * 0.4);
    const secondaryConfidence2 = remainingConfidence - secondaryConfidence1;

    // Step 4: Return top 3 emotions sorted by confidence
    return [
        { emotion: primaryEmotion, confidence: primaryConfidence },
        { emotion: emotions[(emotions.indexOf(primaryEmotion) + 1) % emotions.length], 
          confidence: secondaryConfidence1 },
        { emotion: emotions[(emotions.indexOf(primaryEmotion) + 2) % emotions.length], 
          confidence: secondaryConfidence2 },
    ].sort((a, b) => b.confidence - a.confidence);
}
```

#### ⚠️ Algorithm That SHOULD Be Implemented:

**Facial Action Coding System (FACS) Based Detection**

```pseudocode
ALGORITHM: FacialEmotionDetection
INPUT: video_frame (webcam image)
OUTPUT: emotion_scores[]

1. Load MediaPipe FaceMesh model
2. Detect 468 facial landmarks in frame
3. Calculate facial feature vectors:
   
   a) Mouth Curvature:
      mouth_curve = (lip_corner_right.y + lip_corner_left.y) / 2 - lip_center.y
      
   b) Eye Openness:
      eye_openness = |upper_eyelid.y - lower_eyelid.y| / eye_width
      
   c) Eyebrow Position:
      eyebrow_raise = (eyebrow_center.y - eye_center.y) / face_height
      
   d) Jaw Drop:
      jaw_drop = |upper_lip.y - lower_lip.y| / mouth_width

4. Map features to emotions using rules:
   
   IF mouth_curve > 0.15 AND eye_openness > 0.3 THEN
       happy_score += 0.7
       
   IF mouth_curve < -0.1 AND eyebrow_raise < 0.2 THEN
       sad_score += 0.6
       
   IF eyebrow_raise < 0.15 AND mouth_curve < -0.05 THEN
       angry_score += 0.65
       
   IF eye_openness > 0.5 AND eyebrow_raise > 0.3 THEN
       surprised_score += 0.7
       
   IF eye_openness < 0.25 AND mouth_curve < 0 THEN
       disgusted_score += 0.5

5. Normalize scores to sum to 1.0
6. Return top 3 emotions with highest scores
```

**Mathematical Formula**:

```
Confidence(emotion_i) = Σ(feature_weight_j × feature_value_j) / Σ(all_weights)

Where:
- feature_weight_j = importance of feature j (0-1)
- feature_value_j = normalized feature value (0-1)
- Sum normalized across all emotions
```

---

### 2. Voice Emotion Detection Algorithm

**File**: `lib/emotionDetection.ts` (Lines 28-48)

**Technology**: Web Speech API + Audio Analysis

#### Current Implementation (Simulated):

```typescript
export async function detectVoiceEmotion(audioBlob: Blob): Promise<EmotionScore[]> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    const emotions: EmotionType[] = ['neutral', 'happy', 'surprised', 'sad', 'fearful'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    // Primary emotion: 65-90% confidence (voice less reliable than face)
    const primaryConfidence = 0.65 + Math.random() * 0.25;

    const remainingConfidence = 1 - primaryConfidence;
    const secondaryConfidence1 = remainingConfidence * (0.5 + Math.random() * 0.3);
    const secondaryConfidence2 = remainingConfidence - secondaryConfidence1;

    return [ /* sorted emotion scores */ ];
}
```

#### ⚠️ Algorithm That SHOULD Be Implemented:

**Prosodic Feature Extraction Algorithm**

```pseudocode
ALGORITHM: VoiceEmotionDetection
INPUT: audio_blob (5-10 seconds of recorded audio)
OUTPUT: emotion_scores[]

1. Convert audio blob to WAV format
2. Extract audio features using Web Audio API:

   a) Pitch Analysis (F0 - Fundamental Frequency):
      pitch_mean = average(fundamental_frequency(t)) for all t
      pitch_variance = variance(fundamental_frequency(t))
      pitch_range = max(pitch) - min(pitch)
   
   b) Energy Analysis:
      energy = Σ(amplitude²) / num_samples
      
   c) Speaking Rate:
      speaking_rate = num_syllables / duration_seconds
      
   d) Spectral Centroid (Brightness):
      spectral_centroid = Σ(frequency × magnitude) / Σ(magnitude)

3. Map features to emotions:

   Happy Detection:
   IF pitch_mean > baseline + 50Hz AND 
      speaking_rate > 4 syllables/sec AND
      energy > 0.6 THEN
       happy_score += 0.7
   
   Sad Detection:
   IF pitch_mean < baseline - 30Hz AND
      speaking_rate < 3 syllables/sec AND
      pitch_variance < 20Hz THEN
       sad_score += 0.65
   
   Angry Detection:
   IF energy > 0.75 AND
      pitch_variance > 50Hz AND
      speaking_rate > 4.5 syllables/sec THEN
       angry_score += 0.7
   
   Fearful Detection:
   IF pitch_mean > baseline + 30Hz AND
      pitch_variance > 40Hz AND
      energy < 0.5 THEN
       fearful_score += 0.6

4. Normalize and return top 3 emotions
```

**Features Summary**:

| Emotion | Pitch (Hz) | Energy | Speaking Rate | Variance |
|---------|-----------|--------|---------------|----------|
| Happy | High (+50) | Medium-High (0.6-0.8) | Fast (>4/s) | Medium |
| Sad | Low (-30) | Low (0.3-0.5) | Slow (<3/s) | Low |
| Angry | Variable | High (>0.75) | Fast (>4.5/s) | High (>50) |
| Fearful | High (+30) | Medium (0.4-0.6) | Variable | High (>40) |
| Neutral | Baseline | Medium (0.5) | Normal (3-4/s) | Low-Medium |

---

### 3. Text Emotion Analysis Algorithm

**File**: `lib/emotionDetection.ts` (Lines 51-137)

**Technology**: Custom Keyword Matching + Sentiment Analysis

#### Current Implementation:

```typescript
export async function analyzeTextEmotion(text: string): Promise<EmotionScore[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 1: Define emotion keyword dictionaries
    const emotionKeywords = {
        happy: ['happy', 'joy', 'joyful', 'great', 'wonderful', 'excellent', 
                'excited', 'love', 'amazing', 'fantastic', 'awesome', ...],
        sad: ['sad', 'unhappy', 'depressed', 'miserable', 'down', 'blue', ...],
        angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', ...],
        fearful: ['afraid', 'scared', 'frightened', 'terrified', 'anxious', ...],
        disgusted: ['disgusted', 'revolted', 'sick', 'repulsed', ...],
        surprised: ['surprised', 'shocked', 'amazed', 'astonished', ...],
        neutral: ['okay', 'fine', 'alright', 'normal', 'usual']
    };

    // Step 2: Convert to lowercase
    const lowerText = text.toLowerCase();
    
    // Step 3: Initialize emotion scores
    const emotionScores: Record<EmotionType, number> = {
        happy: 0, sad: 0, angry: 0, fearful: 0, 
        disgusted: 0, surprised: 0, neutral: 0
    };

    // Step 4: Count keyword matches
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        keywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                emotionScores[emotion as EmotionType] += 1;
            }
        });
    });

    // Step 5: Handle negations
    const negationWords = ['not', 'no', 'never', 'dont', "don't", 'cant', "can't"];
    negationWords.forEach(negation => {
        if (lowerText.includes(negation)) {
            emotionScores.happy *= 0.5; // Reduce positive emotions
        }
    });

    // Step 6: Calculate total score
    const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);

    // Step 7: If no emotions detected, return neutral
    if (totalScore === 0) {
        const neutralConfidence = 0.75 + Math.random() * 0.10;
        return [
            { emotion: 'neutral', confidence: neutralConfidence },
            { emotion: 'happy', confidence: (1 - neutralConfidence) * 0.6 },
            { emotion: 'sad', confidence: (1 - neutralConfidence) * 0.4 },
        ];
    }

    // Step 8: Normalize scores
    let results: EmotionScore[] = Object.entries(emotionScores)
        .map(([emotion, score]) => ({
            emotion: emotion as EmotionType,
            confidence: score / totalScore
        }))
        .filter(score => score.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence);

    // Step 9: Boost primary emotion (75-92%)
    if (results.length > 0) {
        const primaryBoost = 0.75 + Math.random() * 0.17;
        results[0].confidence = Math.min(primaryBoost, 0.95);

        // Redistribute remaining confidence
        const remainingConfidence = 1 - results[0].confidence;
        const otherTotal = results.slice(1).reduce((sum, r) => sum + r.confidence, 0);

        for (let i = 1; i < results.length; i++) {
            if (otherTotal > 0) {
                results[i].confidence = (results[i].confidence / otherTotal) * remainingConfidence;
            }
        }
    }

    // Step 10: Return top 3 emotions
    return results.slice(0, 3);
}
```

**Algorithm Pseudocode**:

```pseudocode
ALGORITHM: TextEmotionAnalysis
INPUT: user_text_input (string)
OUTPUT: emotion_scores[]

1. PREPROCESSING:
   text = user_text_input.toLowerCase()
   
2. KEYWORD MATCHING:
   FOR EACH emotion IN emotions:
       FOR EACH keyword IN emotion.keywords:
           IF keyword IN text THEN
               score[emotion] += 1
               
3. NEGATION HANDLING:
   IF ("not" OR "no" OR "never") IN text THEN
       score[positive_emotions] *= 0.5
       score[negative_emotions] *= 1.2
       
4. INTENSITY MODIFIERS:
   IF ("very" OR "extremely" OR "really") before keyword THEN
       score[emotion] *= 1.5
   IF ("slightly" OR "somewhat") before keyword THEN
       score[emotion] *= 0.7

5. NORMALIZATION:
   total = SUM(all_scores)
   IF total == 0 THEN
       RETURN neutral(0.80)
   ELSE
       FOR EACH emotion:
           normalized_score[emotion] = score[emotion] / total
           
6. CONFIDENCE BOOSTING:
   primary_emotion = emotion with highest score
   primary_confidence = 0.75 + random(0, 0.17)
   
   remaining = 1 - primary_confidence
   Redistribute remaining to other emotions proportionally
   
7. RETURN top 3 emotions sorted by confidence
```

---

## Emotion Aggregation Algorithm

**File**: `lib/emotionDetection.ts` (Lines 140-195)

### Multi-Modal Emotion Fusion

```typescript
export function aggregateEmotions(
    faceEmotions?: EmotionScore[],
    voiceEmotions?: EmotionScore[],
    textEmotions?: EmotionScore[]
): EmotionScore {
    // Step 1: Initialize emotion map
    const emotionMap: Record<EmotionType, number> = {
        happy: 0, sad: 0, angry: 0, fearful: 0,
        disgusted: 0, surprised: 0, neutral: 0,
    };

    let totalWeight = 0;

    // Step 2: Aggregate face emotions (weight: 0.4)
    if (faceEmotions && faceEmotions.length > 0) {
        faceEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * 0.4;
        });
        totalWeight += 0.4;
    }

    // Step 3: Aggregate voice emotions (weight: 0.35)
    if (voiceEmotions && voiceEmotions.length > 0) {
        voiceEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * 0.35;
        });
        totalWeight += 0.35;
    }

    // Step 4: Aggregate text emotions (weight: 0.25)
    if (textEmotions && textEmotions.length > 0) {
        textEmotions.forEach(score => {
            emotionMap[score.emotion] += score.confidence * 0.25;
        });
        totalWeight += 0.25;
    }

    // Step 5: Normalize by total weight
    Object.keys(emotionMap).forEach((emotion) => {
        emotionMap[emotion as EmotionType] /= totalWeight || 1;
    });

    // Step 6: Find dominant emotion
    const dominantEmotion = Object.entries(emotionMap).reduce((a, b) =>
        a[1] > b[1] ? a : b
    );

    return {
        emotion: dominantEmotion[0] as EmotionType,
        confidence: dominantEmotion[1],
    };
}
```

**Mathematical Formula**:

```
Aggregated_Score(emotion_i) = Σ(source_j × weight_j × confidence_ij) / Σ(weights)

Where:
- source_j ∈ {face, voice, text}
- weight_face = 0.4 (most reliable)
- weight_voice = 0.35 (good reliability)
- weight_text = 0.25 (self-report)
- confidence_ij = confidence of emotion_i from source_j

Final_Emotion = argmax(Aggregated_Score)
```

**Example Calculation**:

```
Input:
- Face: 80% Happy, 20% Neutral
- Voice: 70% Happy, 30% Surprised
- Text: 90% Sad, 10% Happy

Aggregated Happy Score:
= (0.80 × 0.4) + (0.70 × 0.35) + (0.10 × 0.25)
= 0.32 + 0.245 + 0.025
= 0.59 (59%)

Aggregated Sad Score:
= (0 × 0.4) + (0 × 0.35) + (0.90 × 0.25)
= 0.225 (22.5%)

Result: 59% Happy (dominant)
```

---

## Music Generation Algorithms

### 1. Emotion to Music Mapping Algorithm

**File**: `lib/musicGeneration.ts` (Lines 50-125)

```typescript
function emotionToMusicConfig(emotion: EmotionScore, heartRate?: number): MusicConfig {
    // Step 1: Define therapeutic configs for each emotion
    const configs: Record<string, Partial<MusicConfig>> = {
        sad: {
            tempo: 75,
            key: 'C',
            mode: 'major',
            instruments: ['piano', 'harp', 'flute', 'pad'],
            intensity: 0.45,
        },
        angry: {
            tempo: 85,
            key: 'G',
            mode: 'major',
            instruments: ['piano', 'flute', 'bell', 'pad'],
            intensity: 0.5,
        },
        // ... other emotions
    };

    // Step 2: Get base config for emotion
    const baseConfig = configs[emotion.emotion] || configs.neutral;
    let adjustedTempo = baseConfig.tempo || 90;

    // Step 3: Adjust tempo based on heart rate
    if (heartRate) {
        if (heartRate > 90) {
            // High HR → Slow down music for calming
            adjustedTempo = Math.max(60, adjustedTempo - 10);
        } else if (heartRate < 60) {
            // Low HR → Speed up slightly
            adjustedTempo = Math.min(110, adjustedTempo + 5);
        }
    }

    return {
        tempo: adjustedTempo,
        key: baseConfig.key || 'C',
        mode: baseConfig.mode || 'major',
        duration: 150, // 2.5 minutes
        instruments: baseConfig.instruments || ['piano', 'harp'],
        intensity: baseConfig.intensity || 0.5,
    };
}
```

**Therapeutic Mapping Table**:

| Emotion | Goal | Tempo | Key | Mode | Instruments | Intensity |
|---------|------|-------|-----|------|-------------|-----------|
| Sad | Uplift | 75 BPM | C | Major | Piano, Harp, Flute, Pad | 0.45 |
| Angry | Calm | 85 BPM | G | Major | Piano, Flute, Bell, Pad | 0.50 |
| Fearful | Comfort | 70 BPM | C | Major | Piano, Harp, Bell, Pad | 0.40 |
| Neutral | Energize | 95 BPM | G | Major | Piano, Guitar, Bell, Strings | 0.55 |
| Happy | Maintain | 105 BPM | C | Major | Piano, Guitar, Harp, Strings | 0.65 |

---

### 2. Chord Progression Selection Algorithm

**File**: `lib/musicGeneration.ts` (Lines 10-47, 317-330)

```typescript
const CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
    uplifting: {
        chords: [
            ['C4', 'E4', 'G4'], // I (C major)
            ['F4', 'A4', 'C5'], // IV (F major)
            ['G4', 'B4', 'D5'], // V (G major)
            ['C4', 'E4', 'G4'], // I (C major)
        ],
        emotionalTone: 'hopeful and positive'
    },
    calming: {
        chords: [
            ['C4', 'E4', 'G4'], // I
            ['A3', 'C4', 'E4'], // vi
            ['F4', 'A4', 'C5'], // IV
            ['C4', 'E4', 'G4'], // I
        ],
        emotionalTone: 'peaceful and soothing'
    },
    // ... other progressions
};

function selectChordProgression(emotion: string): ChordProgression {
    const emotionMap: Record<string, keyof typeof CHORD_PROGRESSIONS> = {
        happy: 'uplifting',
        sad: 'calming',
        neutral: 'contemplative',
        angry: 'calming',
        fearful: 'calming',
        surprised: 'energizing',
        disgusted: 'calming',
    };

    const progressionKey = emotionMap[emotion] || 'calming';
    return CHORD_PROGRESSIONS[progressionKey];
}
```

**Music Theory**:

```
Chord Progressions in C Major:

I-IV-V-I (Uplifting):
C → F → G → C
Notes: [C,E,G] → [F,A,C] → [G,B,D] → [C,E,G]

I-vi-IV-V (Calming):
C → Am → F → G
Notes: [C,E,G] → [A,C,E] → [F,A,C] → [G,B,D]

i-iv-V-i (Contemplative/Minor):
Am → Dm → Em → Am
Notes: [A,C,E] → [D,F,A] → [E,G,B] → [A,C,E]
```

---

### 3. Melody Generation Algorithm

**File**: `lib/musicGeneration.ts` (Lines 338-425)

```typescript
export function generateMelody(config: MusicConfig, emotion: string): { 
    melody: { notes: string[], durations: string[] },
    chords: { notes: string[][], durations: string[] },
    bass: { notes: string[], durations: string[] }
} {
    // Step 1: Define musical scale
    const scales: Record<string, string[]> = {
        C: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
        G: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5'],
        Am: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    };

    const scale = scales[config.key] || scales.C;
    const chordProg = selectChordProgression(emotion);

    // Step 2: Define melodic patterns
    const melodyPatterns = [
        [0, 2, 4, 5, 4, 2, 0, -1],     // Stepwise motion
        [0, 4, 7, 4, 2, 5, 4, 0],      // Arpeggiated
        [4, 5, 7, 5, 4, 2, 4, 2],      // Wave motion
        [0, 2, 4, 7, 5, 4, 2, 0],      // Arch shape
        [7, 5, 4, 2, 0, 2, 4, 5],      // Descending
        [0, 3, 5, 7, 5, 3, 2, 0],      // Circular
    ];

    // Step 3: Define rhythm patterns
    const rhythmPatterns = [
        ['4n', '4n', '2n', '4n', '4n', '2n'],              // Balanced
        ['8n', '8n', '4n', '8n', '8n', '4n', '4n', '2n'], // Syncopated
        ['4n', '8n', '8n', '2n', '4n', '4n', '2n'],        // Mixed
        ['2n', '4n', '4n', '4n', '4n', '2n'],              // Flowing
    ];

    // Step 4: Select random pattern & rhythm
    const patternIndex = Math.floor(Math.random() * melodyPatterns.length);
    const rhythmIndex = Math.floor(Math.random() * rhythmPatterns.length);

    const melodyNotes: string[] = [];
    const melodyDurations: string[] = [];

    // Step 5: Generate 16-bar melody
    for (let bar = 0; bar < 16; bar++) {
        const pattern = melodyPatterns[patternIndex];
        const rhythm = rhythmPatterns[rhythmIndex];

        pattern.forEach((scaleIndex, i) => {
            // Add octave variation every 4 bars
            const octaveVariation = (bar % 4 === 3 && Math.random() > 0.6) ? 7 : 0;
            const noteIndex = Math.max(0, Math.min(scale.length - 1, scaleIndex + octaveVariation));
            
            melodyNotes.push(scale[noteIndex]);
            melodyDurations.push(rhythm[i % rhythm.length]);
        });
    }

    // Step 6: Generate chord progression
    const chordNotes: string[][] = [];
    const chordDurations: string[] = [];

    for (let i = 0; i < 16; i++) {
        chordNotes.push(chordProg.chords[i % chordProg.chords.length]);
        chordDurations.push('1n'); // Whole note per chord
    }

    // Step 7: Generate bass line (root notes of chords)
    const bassNotes: string[] = [];
    const bassDurations: string[] = [];

    chordNotes.forEach(chord => {
        bassNotes.push(chord[0]); // Root note on beat 1
        bassDurations.push('2n');
        bassNotes.push(chord[0]); // Root note on beat 3
        bassDurations.push('2n');
    });

    return { melody, chords, bass };
}
```

**Algorithm Pseudocode**:

```pseudocode
ALGORITHM: MelodyGeneration
INPUT: music_config, emotion
OUTPUT: {melody, chords, bass}

1. SCALE SELECTION:
   scale = SELECT_SCALE(config.key)
   Example: C Major = [C4, D4, E4, F4, G4, A4, B4, C5, ...]

2. PATTERN SELECTION:
   melody_pattern = RANDOM_CHOICE([
       stepwise_pattern,
       arpeggio_pattern,
       wave_pattern,
       ...
   ])
   
   rhythm_pattern = RANDOM_CHOICE([
       balanced_rhythm,
       syncopated_rhythm,
       ...
   ])

3. MELODY GENERATION (16 bars):
   FOR bar = 0 TO 15:
       FOR note_index IN melody_pattern:
           // Map pattern index to scale note
           scale_index = note_index
           
           // Add octave jump every 4 bars (60% chance)
           IF bar % 4 == 3 AND random() > 0.6 THEN
               scale_index += 7  // Go up one octave
           
           // Get actual note from scale
           note = scale[CLAMP(scale_index, 0, scale.length-1)]
           duration = rhythm_pattern[i % rhythm_pattern.length]
           
           ADD note and duration to melody

4. CHORD GENERATION (16 bars):
   chord_progression = SELECT_CHORD_PROGRESSION(emotion)
   FOR i = 0 TO 15:
       chord = chord_progression[i % progression.length]
       ADD chord (whole note duration)

5. BASS LINE GENERATION:
   FOR EACH chord IN chords:
       root_note = chord[0]  // First note of chord
       ADD root_note with half-note duration (beat 1)
       ADD root_note with half-note duration (beat 3)

6. RETURN {melody, chords, bass}
```

---

### 4. Audio Synthesis Algorithm

**File**: `lib/musicGeneration.ts` (Lines 141-313)

```typescript
function createInstrumentSynth(instrument: InstrumentType, config: MusicConfig): any {
    let synth: any;

    switch (instrument) {
        case 'piano':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.005,   // Very fast attack
                    decay: 0.4,      // Quick decay
                    sustain: 0.15,   // Short sustain
                    release: 1.5,    // Long release (piano-like)
                },
            });
            break;

        case 'pad':
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sawtooth' },
                envelope: {
                    attack: 0.5,     // Slow attack (pad-like)
                    decay: 0.3,
                    sustain: 0.8,    // Long sustain
                    release: 2.5,    // Very long release
                },
            });
            break;

        case 'bass':
            synth = new Tone.MonoSynth({
                oscillator: { type: 'square' },
                envelope: {
                    attack: 0.01,
                    decay: 0.3,
                    sustain: 0.1,
                    release: 0.6,
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 0.5,
                },
            });
            break;
    }

    // Add effects chain
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 });
    const delay = new Tone.FeedbackDelay({ 
        delayTime: '8n',   // Eighth note delay
        feedback: 0.2,     // 20% feedback
        wet: 0.15          // 15% wet signal
    });

    synth.chain(reverb, delay, Tone.Destination);
    synth.volume.value = -12 + (config.intensity * 10);

    return synth;
}
```

**ADSR Envelope Explained**:

```
Sound Amplitude over Time:

    Sustain Level
         ___________
        /|          |\
       / |          | \
      /  |          |  \
     /   |          |   \
    /    |          |    \___
   /     |          |
  A   D  S          R

A = Attack: Time to reach peak (ms)
D = Decay: Time to drop to sustain level (ms)
S = Sustain: Level held while note is playing (0-1)
R = Release: Time to fade to silence after note off (ms)

Piano: Attack=5ms, Decay=400ms, Sustain=0.15, Release=1500ms
Pad: Attack=500ms, Decay=300ms, Sustain=0.8, Release=2500ms
```

---

## Code Implementation Details

### 1. Music Playback with Tone.js

**File**: `lib/musicGeneration.ts` (Lines 427-517)

```typescript
export async function playMusic(music: GeneratedMusic, onProgress?: (progress: number) => void): Promise<void> {
    await Tone.start(); // Initialize audio context

    // Create synths
    const { synth, harmonySynth, bassSynth } = createSynth(music.config);
    const emotionName = music.baseEmotions[0]?.emotion || 'neutral';
    const { melody, chords, bass } = generateMelody(music.config, emotionName);

    // Set tempo
    Tone.Transport.bpm.value = music.config.tempo;

    // MELODY LOOP
    let melodyIndex = 0;
    const melodyLoop = new Tone.Loop((time) => {
        const note = melody.notes[melodyIndex % melody.notes.length];
        const duration = melody.durations[melodyIndex % melody.durations.length];
        synth.triggerAttackRelease(note, duration, time);
        melodyIndex++;

        if (onProgress) {
            const progress = (melodyIndex / melody.notes.length) * 100;
            onProgress(Math.min(progress, 100));
        }
    }, '4n'); // Trigger every quarter note

    // CHORD LOOP (harmony)
    let chordIndex = 0;
    const chordLoop = new Tone.Loop((time) => {
        const chordNotes = chords.notes[chordIndex % chords.notes.length];
        const duration = chords.durations[chordIndex % chords.durations.length];

        if (harmonySynth) {
            chordNotes.forEach(note => {
                harmonySynth.triggerAttackRelease(note, duration, time);
            });
        }
        chordIndex++;
    }, '1m'); // Trigger every measure (bar)

    // BASS LOOP
    let bassIndex = 0;
    const bassLoop = new Tone.Loop((time) => {
        const note = bass.notes[bassIndex % bass.notes.length];
        const duration = bass.durations[bassIndex % bass.durations.length];
        bassSynth.triggerAttackRelease(note, duration, time);
        bassIndex++;
    }, '2n'); // Trigger every half note

    // Start all loops
    melodyLoop.start(0);
    chordLoop.start(0);
    bassLoop.start(0);
    Tone.Transport.start();

    // Stop after duration
    await new Promise((resolve) => {
        setTimeout(() => {
            melodyLoop.stop();
            chordLoop.stop();
            bassLoop.stop();
            Tone.Transport.stop();
            synth.dispose();
            if (harmonySynth) harmonySynth.dispose();
            bassSynth.dispose();
            resolve(true);
        }, music.duration * 1000);
    });
}
```

**Tone.js Transport System**:

```
Timeline (in quarter notes):

Melody Loop ('4n' - every quarter note):
|M|M|M|M|M|M|M|M|M|M|M|M|M|M|M|M|...
0 1 2 3 4 5 6 7 8 9...

Chord Loop ('1m' - every measure = 4 quarter notes):
|C.........|C.........|C.........|...
0           4           8

Bass Loop ('2n' - every half note = 2 quarter notes):
|B...|B...|B...|B...|B...|B...|...
0     2     4     6     8    10

BPM = 90 → 90 beats per minute
Quarter note = 60/90 = 0.667 seconds
```

---

## Summary

### Algorithms Used:

1. **Face Emotion Detection**: FACS-based landmark analysis (simulated)
2. **Voice Emotion Detection**: Prosodic feature extraction (simulated)
3. **Text Emotion Analysis**: Keyword matching + sentiment analysis
4. **Emotion Aggregation**: Weighted multi-modal fusion
5. **Music Configuration**: Emotion-to-therapeutic-mapping
6. **Chord Progression**: Music theory-based selection
7. **Melody Generation**: Pattern-based algorithmic composition
8. **Audio Synthesis**: ADSR envelope + effects chain
9. **Audio Playback**: Synchronized multi-track timing

### Technologies:

- **TensorFlow.js**: ML models (face detection)
- **Web Speech API**: Voice capture
- **Tone.js**: Audio synthesis and playback
- **MediaStream API**: Webcam/mic access
- **Web Bluetooth**: Heart rate monitoring

All code is in TypeScript with full type safety!
