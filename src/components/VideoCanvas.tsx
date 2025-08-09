import React, { useRef, useEffect } from 'react';
import { Detection } from '../types/detection';
import { drawDetections, drawPerformanceInfo } from '../utils/drawUtils';

interface VideoCanvasProps {
  width: number;
  height: number;
  detections: Detection[];
  getTrackColor: (id: string) => string;
  showPerformanceInfo?: boolean;
  fps?: number;
  processingTime?: number;
  objectCount?: number;
}

export function VideoCanvas({
  width,
  height,
  detections,
  getTrackColor,
  showPerformanceInfo = false,
  fps = 0,
  processingTime = 0,
  objectCount = 0
}: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw detections
    drawDetections(ctx, detections, getTrackColor);

    // Draw performance info if enabled
    if (showPerformanceInfo) {
      drawPerformanceInfo(ctx, fps, processingTime, objectCount);
    }
  }, [detections, getTrackColor, width, height, showPerformanceInfo, fps, processingTime, objectCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
}