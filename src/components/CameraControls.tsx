import React from 'react';
import { Play, Pause, RotateCcw, Upload, Camera } from 'lucide-react';

interface CameraControlsProps {
  isActive: boolean;
  isDetecting: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleDetection: () => void;
  onReset: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
}

export function CameraControls({
  isActive,
  isDetecting,
  onStart,
  onStop,
  onToggleDetection,
  onReset,
  onFileUpload,
  devices,
  selectedDevice,
  onDeviceChange
}: CameraControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
      {/* Camera Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={isActive ? onStop : onStart}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 inline mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Play className="w-4 h-4 inline mr-2" />
              Start Camera
            </>
          )}
        </button>

        <button
          onClick={onToggleDetection}
          disabled={!isActive}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isDetecting
              ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isDetecting ? 'Pause Detection' : 'Start Detection'}
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 transition-all"
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Reset
        </button>
      </div>

      {/* Device Selection */}
      {devices.length > 1 && (
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-gray-400" />
          <select
            value={selectedDevice}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId} className="bg-gray-900">
                {device.label || `Camera ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File Upload */}
      <div className="flex items-center">
        <label className="px-4 py-2 rounded-lg font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 cursor-pointer transition-all">
          <Upload className="w-4 h-4 inline mr-2" />
          Upload Video
          <input
            type="file"
            accept="video/*"
            onChange={onFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}