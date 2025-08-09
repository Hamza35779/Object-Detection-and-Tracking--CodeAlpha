import React, { useEffect, useRef, useState } from 'react';
import { Eye, AlertCircle, Loader } from 'lucide-react';
import { useCamera } from './hooks/useCamera';
import { useObjectDetection } from './hooks/useObjectDetection';
import { CameraControls } from './components/CameraControls';
import { StatsDisplay } from './components/StatsDisplay';
import { VideoCanvas } from './components/VideoCanvas';
import { Detection } from './types/detection';

function App() {
  const {
    videoRef,
    isActive: isCameraActive,
    error: cameraError,
    devices,
    deviceId,
    startCamera,
    stopCamera,
    switchCamera
  } = useCamera();

  const {
    isLoading: isModelLoading,
    isDetecting,
    error: modelError,
    stats,
    detectObjects,
    resetTracking,
    getTrackColor,
    setIsDetecting
  } = useObjectDetection();

  const [detections, setDetections] = useState<Detection[]>([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const animationFrameRef = useRef<number>();

  // Detection loop
  useEffect(() => {
    if (!isDetecting || !videoRef.current || !isCameraActive) return;

    const detectLoop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const newDetections = await detectObjects(videoRef.current);
        setDetections(newDetections);
      }
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, isCameraActive, detectObjects]);

  // Update video dimensions when video loads
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };

  const handleToggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  const handleReset = () => {
    resetTracking();
    setDetections([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      stopCamera();
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.onloadeddata = () => {
        videoRef.current?.play();
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Object Detection & Tracking
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Real-time computer vision with TensorFlow.js and advanced object tracking
          </p>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Error Display */}
          {(cameraError || modelError) && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-400">Error</h3>
                <p className="text-red-300">{cameraError || modelError}</p>
              </div>
            </div>
          )}

          {/* Loading Display */}
          {isModelLoading && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-400">Loading</h3>
                <p className="text-blue-300">Loading TensorFlow.js model...</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <CameraControls
            isActive={isCameraActive}
            isDetecting={isDetecting}
            onStart={startCamera}
            onStop={stopCamera}
            onToggleDetection={handleToggleDetection}
            onReset={handleReset}
            onFileUpload={handleFileUpload}
            devices={devices}
            selectedDevice={deviceId}
            onDeviceChange={switchCamera}
          />

          {/* Stats */}
          <StatsDisplay stats={stats} />

          {/* Video Display */}
          <div className="relative bg-black rounded-xl overflow-hidden border border-white/10">
            <div className="relative aspect-video w-full">
              <video
                ref={videoRef}
                onLoadedMetadata={handleVideoLoadedMetadata}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              
              {/* Overlay Canvas */}
              {(isCameraActive || videoRef.current?.src) && (
                <VideoCanvas
                  width={videoDimensions.width}
                  height={videoDimensions.height}
                  detections={detections}
                  getTrackColor={getTrackColor}
                  showPerformanceInfo={false}
                />
              )}

              {/* Status Overlay */}
              {isDetecting && (
                <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">DETECTING</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">How to Use</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Camera Detection</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Click "Start Camera" to begin video input</li>
                  <li>• Click "Start Detection" to enable object detection</li>
                  <li>• Switch between cameras if multiple are available</li>
                  <li>• Objects are tracked with unique IDs and colors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Video Files</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Upload video files using "Upload Video"</li>
                  <li>• Supports common video formats (MP4, WebM, etc.)</li>
                  <li>• Click "Reset" to clear tracking history</li>
                  <li>• Monitor performance with real-time statistics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;