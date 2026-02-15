# Face Emotion Recognition (FER) Model Setup

## Overview

Smart Care uses a **TensorFlow.js-based face emotion recognition model** trained on the FER2013 dataset to detect 7 emotions in real-time.

## Supported Emotions

- Angry
- Disgust
- Fear
- Happy
- Neutral
- Sad
- Surprise

## Model Options

### Option 1: Use Pre-trained Model from TensorFlow Hub (Recommended)

We'll use a converted FER2013 model optimized for browser inference.

**Steps**:

1. Download the pre-trained model:
   - Visit: https://www.kaggle.com/models/google/mobilenet-v3/tfJs/small-075-224-feature-vector
   - Or use our recommended FER model (instructions below)

2. Convert to TensorFlow.js format (if needed):
   ```bash
   pip install tensorflowjs
   tensorflowjs_converter \
       --input_format=keras \
       path/to/model.h5 \
       public/models/fer/
   ```

3. Place in your project:
   ```
   e:\Smart_Care\public\models\fer\
   ├── model.json
   ├── group1-shard1of1.bin
   └── group1-shard2of1.bin (if multiple shards)
   ```

### Option 2: Use a Simple Pre-built Model (Quick Start)

For testing, you can use a lightweight model:

1. Create the directory:
   ```bash
   mkdir -p public/models/fer
   ```

2. Download from our repository:
   ```bash
   # Coming soon: Direct download link
   # For now, the system will fall back to simulation
   ```

### Option 3: Train Your Own Model

If you want custom training:

```python
# Python training script
import tensorflow as tf
from tensorflow import keras

# Load FER2013 dataset
# ... data loading code ...

# Build model
model = keras.Sequential([
    keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(48, 48, 1)),
    keras.layers.MaxPooling2D((2, 2)),
    keras.layers.Conv2D(64, (3, 3), activation='relu'),
    keras.layers.MaxPooling2D((2, 2)),
    keras.layers.Conv2D(64, (3, 3), activation='relu'),
    keras.layers.Flatten(),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dropout(0.5),
    keras.layers.Dense(7, activation='softmax')
])

# Train
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_images, train_labels, epochs=50, validation_split=0.2)

# Convert to TensorFlow.js
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, 'public/models/fer')
```

## Integration Status

✅ **Module Created**: `lib/mlModels/ferModel.ts`  
✅ **Preprocessing**: Image resizing, grayscale conversion, normalization  
✅ **Inference**: Softmax probabilities from TensorFlow.js  
⏳ **Model File**: Needs to be added to `/public/models/fer/`

## How It Works

```typescript
import { detectFaceEmotionTFJS } from '@/lib/mlModels/ferModel';

// Capture image from webcam
const imageData = 'data:image/jpeg;base64,...';

// Run inference
const emotions = await detectFaceEmotionTFJS(imageData);

// Result (sorted by confidence):
// [
//   { emotion: 'happy', confidence: 0.85 },
//   { emotion: 'neutral', confidence: 0.10 },
//   { emotion: 'surprised', confidence: 0.05 }
// ]
```

## Performance

- **Inference Time**: ~50-100ms on modern browsers (WebGL accelerated)
- **Model Size**: ~2-5 MB (quantized)
- **Accuracy**: ~70-75% on FER2013 test set

## Fallback Behavior

If the model file is not present:
- The system will throw an error and fall back to the **simulated face detection**
- User experience is not interrupted
- A warning is logged to the console

## Next Steps

1. **Add model file** to `/public/models/fer/`
2. **Update** `lib/emotionDetection.ts` to use `detectFaceEmotionTFJS()`
3. **Test** with live webcam feed
4. **Optimize** with model quantization

## Model Quantization (Optional)

To reduce model size and improve inference speed:

```bash
tensorflowjs_converter \
    --input_format=keras \
    --quantization_bytes=2 \
    path/to/model.h5 \
    public/models/fer/
```

This reduces model size by ~75% with minimal accuracy loss.

## Troubleshooting

**Q: "Failed to load FER model" error**
- A: Make sure `model.json` exists in `/public/models/fer/`
- Check browser console for the exact error
- Verify all shard files (.bin) are present

**Q: Slow inference (>500ms)**
- A: Enable WebGL backend: `tf.setBackend('webgl')`
- Consider model quantization
- Check if browser supports WebGL

**Q: Getting random emotions**
- A: You're running with the fallback simulation
- Add the actual model file to fix this

## Resources

- FER2013 Dataset: https://www.kaggle.com/datasets/msambare/fer2013
- TensorFlow.js: https://www.tensorflow.org/js
- Pre-trained models: https://tfhub.dev/
