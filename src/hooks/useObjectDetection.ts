import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Detection, DetectionStats } from '../types/detection';
import { ObjectTracker } from '../utils/objectTracker';

export function useObjectDetection() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DetectionStats>({
    fps: 0,
    objectCount: 0,
    processingTime: 0,
    totalDetections: 0
  });

  const trackerRef = useRef(new ObjectTracker());
  const frameTimeRef = useRef(0);
  const totalDetectionsRef = useRef(0);

  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Set TensorFlow.js backend
        await tf.setBackend('webgl');
        await tf.ready();
        
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load model');
        setIsLoading(false);
      }
    }

    loadModel();
  }, []);

  const detectObjects = useCallback(async (
    videoElement: HTMLVideoElement
  ): Promise<Detection[]> => {
    if (!model || !videoElement) return [];

    const startTime = performance.now();
    
    try {
      const predictions = await model.detect(videoElement);
      const processingTime = performance.now() - startTime;
      
      // Convert predictions to our detection format
      const detections: Omit<Detection, 'id'>[] = predictions.map(prediction => ({
        class: prediction.class,
        confidence: prediction.score,
        bbox: prediction.bbox as [number, number, number, number],
        centerX: prediction.bbox[0] + prediction.bbox[2] / 2,
        centerY: prediction.bbox[1] + prediction.bbox[3] / 2,
        timestamp: Date.now()
      }));

      // Apply tracking
      const trackedDetections = trackerRef.current.track(detections);
      
      // Update stats
      const currentTime = performance.now();
      const deltaTime = currentTime - frameTimeRef.current;
      const fps = deltaTime > 0 ? 1000 / deltaTime : 0;
      frameTimeRef.current = currentTime;
      
      totalDetectionsRef.current += trackedDetections.length;
      
      setStats({
        fps,
        objectCount: trackerRef.current.getTrackCount(),
        processingTime,
        totalDetections: totalDetectionsRef.current
      });

      return trackedDetections;
    } catch (err) {
      console.error('Detection error:', err);
      return [];
    }
  }, [model]);

  const resetTracking = useCallback(() => {
    trackerRef.current.reset();
    totalDetectionsRef.current = 0;
    setStats(prev => ({ ...prev, totalDetections: 0, objectCount: 0 }));
  }, []);

  const getTrackColor = useCallback((id: string) => {
    return trackerRef.current.getActiveTrackColor(id);
  }, []);

  return {
    model,
    isLoading,
    isDetecting,
    error,
    stats,
    detectObjects,
    resetTracking,
    getTrackColor,
    setIsDetecting
  };
}