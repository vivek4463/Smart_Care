
import { getFinalEmotion } from './src/lib/emotionFusion.js';

const testCases = [
  {
    name: "Strong Face Agreement",
    data: { face: "Happy", text: "Neutral", voice: "Calm", heartRate: 72 },
    expected: "Joy"
  },
  {
    name: "Conflict: Face(Sad) vs Text(Joy)",
    data: { face: "Sad", text: "Joy", voice: "Calm", heartRate: 72 },
    // Face weight (0.55) > Text weight (0.25) -> Sadness
    expected: "Sadness"
  },
  {
    name: "Convergence: Face(Angry) + Text(Anger)",
    data: { face: "Angry", text: "Anger", voice: "Silence", heartRate: 85 },
    expected: "Anger"
  },
  {
    name: "High Heart Rate Override",
    data: { face: "Happy", text: "Neutral", voice: "Calm", heartRate: 120 },
    expected: "Panic/Distress"
  },
  {
    name: "Text Dominance over Voice",
    data: { face: "", text: "Joy", voice: "Unsettled", heartRate: 70 },
    expected: "Joy"
  },
  {
    name: "New Voice Mapping: Stressed",
    data: { face: "", text: "Neutral", voice: "Stressed", heartRate: 70 },
    expected: "Anxiety"
  },
  {
    name: "New Voice Mapping: Excited",
    data: { face: "", text: "Neutral", voice: "Excited", heartRate: 70 },
    expected: "Joy"
  },
  {
    name: "Signal Expiration: Old Joy vs New Neutral",
    data: { 
      face: { emotion: "Happy", confidence: 0.9, timestamp: Date.now() - 40000 }, // Expired
      text: "Neutral", 
      voice: "Neutral", 
      heartRate: 70 
    },
    expected: "Neutral"
  }
];

testCases.forEach(tc => {
  try {
    const result = getFinalEmotion(tc.data);
    console.log(`Test: ${tc.name}`);
    console.log(`- Detected: ${result.finalEmotion}`);
    console.log(`- Confidence: ${result.confidence}%`);
    console.log(`- Expected: ${tc.expected}`);
    console.log(result.finalEmotion === tc.expected ? "✅ PASS" : "❌ FAIL");
  } catch (err) {
    console.log(`Test: ${tc.name} ❌ ERROR: ${err.message}`);
  }
  console.log('---');
});
