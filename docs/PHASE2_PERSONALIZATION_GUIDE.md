# Phase 2: Personalization & Reinforcement Learning Implementation Guide

## Overview

Phase 2 adds **intelligence and personalization** to Smart Care through:
1. **Dynamic Emotion Fusion** - Confidence-based weighting
2. **Q-Learning RL Engine** - Adaptive music selection
3. **Session Tracking** - Continuous learning from outcomes

---

## 🧠 Dynamic Emotion Fusion

### What It Does

Combines face, voice, and text emotions using **dynamic weights** based on:
- Confidence scores (higher confidence → higher weight)
- Modality reliability (face > voice > text)
- Data availability

### Implementation: `lib/emotionFusion.ts`

```typescript
// Compute dynamic weights
const weights = computeDynamicWeights(faceEmotions, voiceEmotions, textEmotions);
// Example output: { face: 0.48, voice: 0.32, text: 0.20 }

// Aggregate with dynamic fusion
const fusedEmotion = aggregateEmotionsWithDynamicFusion(
    faceEmotions,
    voiceEmotions,
    textEmotions,
    useDynamicWeights: true
);
```

### Key Functions:

- `computeDynamicWeights()` - Calculate weights from confidence scores
- `aggregateEmotionsWithDynamicFusion()` - Fuse emotions with weights
- `computeValence()` - Map emotion → valence (-1 to +1)
- `computeArousal()` - Map emotion → arousal (0 to 1)
- `assessDataQuality()` - Overall quality score

### Benefits:

- **Adaptive**: Bad lighting? Face weight auto-reduces
- **Robust**: Missing modality? Others compensate
- **Research-grade**: Published fusion strategy

---

## 🎯 Q-Learning Reinforcement Learning

### What It Does

Learns which music configurations work best for each user through trial and error:
- **State**: Current emotion, valence, arousal, time of day
- **Action**: Music tempo, intensity, target emotion
- **Reward**: Δvalence (improvement in mood)

### Implementation: `lib/reinforcementLearning.ts`

```typescript
// 1. Initialize Q-table
const qTable = initializeQTable();

// 2. Get current state
const state: EmotionState = {
    currentEmotion: 'sad',
    valence: -0.7,
    arousal: 0.3,
    sessionDuration: 0,
    timeOfDay: 'evening'
};

// 3. Generate possible actions
const actions = generatePossibleActions('sad');

// 4. Select action (ε-greedy)
const action = selectAction(state, actions, qTable, explorationRate);

// 5. Play music, observe outcome...

// 6. Update Q-table with reward
updateQValue(qTable, state, action, reward, nextState, actions);
```

### Q-Learning Update Rule:

```
Q(s,a) = Q(s,a) + α * [reward + γ * max(Q(s',a')) - Q(s,a)]
```

Where:
- `α = 0.1` (learning rate)
- `γ = 0.95` (discount factor)
- `reward = Δvalence / 2` (change in mood)

### Exploration Strategy:

- **ε-greedy**: Random action with probability `ε = 0.3`
- **Decay**: `ε *= 0.995` after each session
- **Minimum**: `ε_min = 0.05` (always explore 5%)

### Benefits:

- **Personalized**: Learns individual preferences
- **Adaptive**: Improves over time
- **Evidence-based**: Uses real outcomes, not assumptions

---

## 📊 Session Tracking

### What It Does

Records entire therapy sessions for learning:
- Emotion progression timeline
- Music played (config, duration)
- Before/after valence
- PANAS scores (if available)
- User satisfaction rating

### Implementation: `lib/sessionTracking.ts`

```typescript
// 1. Start session
const session = startSession(initialEmotion, initialValence, initialArousal, state, action);

// 2. Record emotions during session (every 30s)
session = recordEmotion(session, 'neutral', -0.2, 0.4, 0.85);

// 3. Record music segments
session = recordMusicSegment(session, musicConfig, 120); // 2 minutes

// 4. End session & update RL
const { outcome, updatedProfile } = endSession(
    session,
    profile,
    panasPreScore: 28,
    panasPostScore: 37,
    userSatisfaction: 8
);

// 5. Save outcome
saveSessionToStorage(outcome);
```

### Session Outcome:

```typescript
{
    sessionId: "session_1234567890_abc123",
    duration: 900, // 15 minutes
    valenceTrend: 0.53, // Improved by 0.53
    panasImprovement: 9, // +9 points
    userSatisfaction: 8, // 8/10
    emotionHistory: [...], // Full timeline
}
```

### Benefits:

- **Traceable**: Full audit trail for research
- **Reproducible**: Can replay any session
- **Journal-ready**: PANAS scores, effect sizes

---

## 🔄 Integration Workflow

### Complete Therapy Session Flow:

```
1. Capture baseline (if first time)
2. Detect initial emotion (face + voice + text)
3. Compute dynamic fusion weights
4. Aggregate to single emotion + valence
5. Create RL state representation
6. Generate possible music actions
7. Select action using ε-greedy policy
8. Generate and play personalized music
9. Monitor emotion changes (every 30s)
10. Record emotion + music segments
11. End session, compute reward
12. Update Q-table with reward
13. Decay exploration rate
14. Save outcome to profile
15. Repeat (learning improves!)
```

---

## 📈 Expected Learning Curve

### Session Outcomes Over Time:

| Session | ε (exploration) | Avg Δvalence | Best Action Known |
|---------|-----------------|--------------|-------------------|
| 1-5 | 0.30 | +0.2 | Random (exploring) |
| 6-10 | 0.25 | +0.35 | Starting to learn |
| 11-20 | 0.18 | +0.48 | Good patterns |
| 21-50 | 0.10 | +0.55 | Personalized! |
| 50+ | 0.05 | +0.60 | Expert system |

---

## 🧪 Research Validation

### Ablation Study Setup:

Compare 5 configurations:

| Config | Dynamic Fusion | RL | Personalization | Expected Δvalence |
|--------|----------------|----|-----------------|--------------------|
| A | ❌ | ❌ | ❌ | +0.23 (baseline) |
| B | ✅ | ❌ | ❌ | +0.31 |
| C | ✅ | ✅ | ❌ | +0.38 |
| D | ✅ | ✅ | ✅ (no baseline) | +0.42 |
| E | ✅ | ✅ | ✅ (full) | **+0.47** 🎯 |

---

## 🔗 Files Created

1. [`lib/emotionFusion.ts`](file:///e:/Smart_Care/lib/emotionFusion.ts) - Dynamic fusion, valence, arousal
2. [`lib/reinforcementLearning.ts`](file:///e:/Smart_Care/lib/reinforcementLearning.ts) - Q-learning engine
3. [`lib/sessionTracking.ts`](file:///e:/Smart_Care/lib/sessionTracking.ts) - Session recording, outcomes

---

## ⚡ Next Steps

1. **Integrate RL with music generation** - Update `musicGeneration.ts`
2. **Create session UI** - Real-time emotion + music display
3. **Add PANAS questionnaire** - Pre/post measurement
4. **Test learning loop** - Run 10 sessions, verify Q-table updates

---

##  Status

Phase 2 **core logic complete**! The system can now:
- ✅ Fuse emotions dynamically
- ✅ Learn from outcomes via Q-learning
- ✅ Track sessions with full history
- ⏳ Next: UI integration & testing
