import { Detection, TrackedObject } from '../types/detection';

export class ObjectTracker {
  private trackedObjects: Map<string, TrackedObject> = new Map();
  private nextId = 1;
  private readonly maxDistance = 100;
  private readonly maxAge = 30; // frames
  private readonly colors = [
    '#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', 
    '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'
  ];

  track(detections: Omit<Detection, 'id'>[]): Detection[] {
    const currentFrame = Date.now();
    const trackedDetections: Detection[] = [];

    // Update existing tracks or create new ones
    for (const detection of detections) {
      const matchedTrack = this.findClosestTrack(detection);
      
      if (matchedTrack) {
        // Update existing track
        const fullDetection: Detection = {
          ...detection,
          id: matchedTrack.id
        };
        
        matchedTrack.detections.push(fullDetection);
        matchedTrack.lastSeen = currentFrame;
        matchedTrack.isActive = true;
        
        // Keep only recent detections
        matchedTrack.detections = matchedTrack.detections
          .filter(d => currentFrame - d.timestamp < 1000)
          .slice(-10);
        
        trackedDetections.push(fullDetection);
      } else {
        // Create new track
        const newId = `track_${this.nextId++}`;
        const color = this.colors[this.trackedObjects.size % this.colors.length];
        
        const fullDetection: Detection = {
          ...detection,
          id: newId
        };
        
        const newTrack: TrackedObject = {
          id: newId,
          detections: [fullDetection],
          lastSeen: currentFrame,
          color,
          isActive: true
        };
        
        this.trackedObjects.set(newId, newTrack);
        trackedDetections.push(fullDetection);
      }
    }

    // Mark inactive tracks
    for (const [id, track] of this.trackedObjects) {
      if (currentFrame - track.lastSeen > this.maxAge * 33) { // ~33ms per frame at 30fps
        track.isActive = false;
      }
    }

    // Clean up old tracks
    for (const [id, track] of this.trackedObjects) {
      if (currentFrame - track.lastSeen > this.maxAge * 100) {
        this.trackedObjects.delete(id);
      }
    }

    return trackedDetections;
  }

  private findClosestTrack(detection: Omit<Detection, 'id'>): TrackedObject | null {
    let closestTrack: TrackedObject | null = null;
    let minDistance = Infinity;

    for (const track of this.trackedObjects.values()) {
      if (!track.isActive || track.detections.length === 0) continue;

      const lastDetection = track.detections[track.detections.length - 1];
      const distance = Math.sqrt(
        Math.pow(detection.centerX - lastDetection.centerX, 2) +
        Math.pow(detection.centerY - lastDetection.centerY, 2)
      );

      if (distance < this.maxDistance && distance < minDistance) {
        minDistance = distance;
        closestTrack = track;
      }
    }

    return closestTrack;
  }

  getActiveTrackColor(id: string): string {
    const track = this.trackedObjects.get(id);
    return track?.color || '#00ff88';
  }

  getTrackCount(): number {
    return Array.from(this.trackedObjects.values()).filter(t => t.isActive).length;
  }

  reset(): void {
    this.trackedObjects.clear();
    this.nextId = 1;
  }
}