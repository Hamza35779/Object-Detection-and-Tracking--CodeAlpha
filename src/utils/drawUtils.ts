import { Detection } from '../types/detection';

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: Detection[],
  getTrackColor: (id: string) => string
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  detections.forEach(detection => {
    const [x, y, width, height] = detection.bbox;
    const color = getTrackColor(detection.id);
    
    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, width, height);
    
    // Draw filled background for label
    const label = `${detection.class} (${Math.round(detection.confidence * 100)}%)`;
    const labelPadding = 8;
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(label).width;
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 30, textWidth + labelPadding * 2, 30);
    
    // Draw label text
    ctx.fillStyle = '#000';
    ctx.fillText(label, x + labelPadding, y - 10);
    
    // Draw track ID
    const trackId = detection.id;
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(trackId, x + 5, y + height - 5);
    
    // Draw center point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(detection.centerX, detection.centerY, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

export function drawPerformanceInfo(
  ctx: CanvasRenderingContext2D,
  fps: number,
  processingTime: number,
  objectCount: number
): void {
  const info = [
    `FPS: ${fps.toFixed(1)}`,
    `Processing: ${processingTime.toFixed(1)}ms`,
    `Objects: ${objectCount}`
  ];
  
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 200, info.length * 25 + 10);
  
  ctx.fillStyle = '#00ff88';
  info.forEach((text, index) => {
    ctx.fillText(text, 20, 35 + index * 25);
  });
}