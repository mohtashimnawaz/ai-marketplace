// Optional dependency - only load if available
let ort: any;
try {
  ort = require('onnxruntime-node');
} catch (err) {
  console.warn('onnxruntime-node not available. Inference will use mock mode.');
  ort = null;
}

import fs from 'fs';
import path from 'path';

// Model cache to avoid reloading
const modelCache = new Map<string, any>();

export async function runInference(
  modelId: string,
  inputs: any
): Promise<any> {
  try {
    // Check if ONNX runtime is available
    if (!ort) {
      console.log('Running inference in mock mode (onnxruntime-node not installed)');
      return {
        outputs: [[0.5, 0.3, 0.2]], // Mock output
        mode: 'mock',
        message: 'Install onnxruntime-node for real inference'
      };
    }

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
    const feeds: Record<string, any> = {};
    
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
      const typedTensor = tensor as any;
      output[key] = {
        data: Array.from(typedTensor.data as Float32Array | Int32Array | Uint8Array),
        dims: typedTensor.dims,
        type: typedTensor.type,
      };
    }

    return output;
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
}

export async function loadModel(modelPath: string): Promise<any> {
  try {
    if (!ort) {
      throw new Error('onnxruntime-node not available');
    }
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
