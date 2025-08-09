export interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  centerX: number;
  centerY: number;
  timestamp: number;
}

export interface TrackedObject {
  id: string;
  detections: Detection[];
  lastSeen: number;
  color: string;
  isActive: boolean;
}

export interface DetectionStats {
  fps: number;
  objectCount: number;
  processingTime: number;
  totalDetections: number;
}