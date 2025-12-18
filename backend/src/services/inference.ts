import * as ort from 'onnxruntime-node';
import fs from 'fs';
import path from 'path';

// Model cache to avoid reloading
const modelCache = new Map<string, ort.InferenceSession>();

export async function runInference(
  modelId: string,
  inputs: any
): Promise<any> {
  try {
    // Check if model is in cache
    let session = modelCache.get(modelId);

    if (!session) {
      // Load model from local storage
      const modelPath = path.join(
        process.env.MODEL_STORAGE_PATH || './models',
        `${modelId}.onnx`
      );

      if (!fs.existsSync(modelPath)) {
        throw new Error('Model file not found locally');
      }

      session = await ort.InferenceSession.create(modelPath);
      modelCache.set(modelId, session);
    }

    // Prepare input tensors
    const feeds: Record<string, ort.Tensor> = {};
    
    // Example: Convert input data to tensors
    // This needs to be adapted based on your model's input requirements
    for (const [key, value] of Object.entries(inputs)) {
      if (Array.isArray(value)) {
        feeds[key] = new ort.Tensor('float32', Float32Array.from(value), [1, value.length]);
      }
    }

    // Run inference
    const results = await session.run(feeds);

    // Convert output tensors to JSON-serializable format
    const output: Record<string, any> = {};
    for (const [key, tensor] of Object.entries(results)) {
      output[key] = {
        data: Array.from(tensor.data),
        dims: tensor.dims,
        type: tensor.type,
      };
    }

    return output;
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
}

export async function loadModel(modelPath: string): Promise<ort.InferenceSession> {
  try {
    const session = await ort.InferenceSession.create(modelPath);
    return session;
  } catch (error) {
    console.error('Model loading error:', error);
    throw error;
  }
}

export function clearModelCache(modelId?: string) {
  if (modelId) {
    modelCache.delete(modelId);
  } else {
    modelCache.clear();
  }
}
